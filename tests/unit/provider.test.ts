import { z } from 'zod';
import {
  DeterministicProvider,
  OpenAIProvider,
  type OpenAITransport,
  type OpenAITransportResponse,
} from '../../src/providers/provider';
import { GovernedProvider } from '../../src/providers/governed-provider';
import { MemoryLogger } from '../../src/logging/logger';

describe('DeterministicProvider', () => {
  it('returns schema-validated local output with zero external usage', async () => {
    const provider = new DeterministicProvider();
    const response = await provider.complete(
      { operation: 'sum', input: [2, 3], localDerivation: () => ({ total: 5 }) },
      z.object({ total: z.number() })
    );
    expect(response.data.total).toBe(5);
    expect(response.provider).toBe('local');
    expect(response.usage.totalTokens).toBe(0);
  });

  it('rejects output that does not satisfy the requested schema', async () => {
    const provider = new DeterministicProvider();
    await expect(
      provider.complete<{ total: number }>(
        {
          operation: 'invalid',
          input: null,
          localDerivation: () => ({ total: 'five' }) as unknown as { total: number },
        },
        z.object({ total: z.number() })
      )
    ).rejects.toThrow();
  });

  it('requires an explicit local derivation and rejects calls after close', async () => {
    const provider = new DeterministicProvider();
    await expect(
      provider.complete(
        { operation: 'missing', input: null, localDerivation: undefined as never },
        z.object({ ok: z.boolean() })
      )
    ).rejects.toThrow('deterministic derivation');
    await provider.close();
    await expect(
      provider.complete(
        { operation: 'closed', input: null, localDerivation: () => ({ ok: true }) },
        z.object({ ok: z.boolean() })
      )
    ).rejects.toThrow('closed');
  });

  it('rejects local cancellation before invoking the derivation', async () => {
    const provider = new DeterministicProvider();
    const controller = new AbortController();
    controller.abort();
    await expect(
      provider.complete(
        { operation: 'aborted', input: null, localDerivation: () => ({ ok: true }) },
        z.object({ ok: z.boolean() }),
        controller.signal
      )
    ).rejects.toThrow('cancelled');
  });
});

describe('OpenAIProvider transport boundary', () => {
  const options = {
    apiKey: 'test-key',
    model: 'test-model',
    timeoutMs: 1000,
    maxRetries: 1,
    retryBaseMs: 1,
    promptCostPerMillionUsd: 1,
    completionCostPerMillionUsd: 2,
  };

  it('validates structured output and accounts for usage without requiring a local derivation', async () => {
    const response: OpenAITransportResponse = {
      id: 'response-1',
      model: 'test-model',
      parsed: { value: 7 },
      usage: { prompt_tokens: 10, completion_tokens: 4, total_tokens: 14 },
    };
    const transport: OpenAITransport = { complete: async () => response };
    const provider = new OpenAIProvider({ ...options, transport });
    const result = await provider.complete(
      { operation: 'value', input: { request: 'seven' } },
      z.object({ value: z.number() })
    );
    expect(result.data.value).toBe(7);
    expect(result.requestId).toBe('response-1');
    expect(provider.getUsage()).toEqual({
      promptTokens: 10,
      completionTokens: 4,
      totalTokens: 14,
      costUsd: 0.000018,
    });
  });

  it('retries retryable transport failures but does not retry invalid structured output', async () => {
    let calls = 0;
    const retrying: OpenAITransport = {
      complete: async () => {
        calls += 1;
        if (calls === 1) throw { status: 503 };
        return { id: 'ok', model: 'test-model', parsed: { value: 1 } };
      },
    };
    const provider = new OpenAIProvider({ ...options, transport: retrying });
    await expect(
      provider.complete({ operation: 'retry', input: null }, z.object({ value: z.number() }))
    ).resolves.toEqual(expect.objectContaining({ requestId: 'ok' }));
    expect(calls).toBe(2);

    let invalidCalls = 0;
    const invalid = new OpenAIProvider({
      ...options,
      transport: {
        complete: async () => {
          invalidCalls += 1;
          return { id: 'bad', model: 'test-model', parsed: { value: 'nope' } };
        },
      },
    });
    await expect(
      invalid.complete({ operation: 'invalid', input: null }, z.object({ value: z.number() }))
    ).rejects.toThrow('schema validation');
    expect(invalidCalls).toBe(1);
  });

  it('refuses an already-aborted request before invoking transport', async () => {
    let calls = 0;
    const provider = new OpenAIProvider({
      ...options,
      transport: {
        complete: async () => {
          calls += 1;
          return { id: 'never', model: 'test-model', parsed: { ok: true } };
        },
      },
    });
    const controller = new AbortController();
    controller.abort();
    await expect(
      provider.complete(
        { operation: 'abort', input: null },
        z.object({ ok: z.boolean() }),
        controller.signal
      )
    ).rejects.toThrow('cancelled');
    expect(calls).toBe(0);
  });

  it('does not retry refusals or non-retryable failures and reports provider errors safely', async () => {
    let refusalCalls = 0;
    const refusal = new OpenAIProvider({
      ...options,
      transport: {
        complete: async () => {
          refusalCalls += 1;
          return { id: 'refused', model: 'test-model', parsed: null, refusal: 'policy' };
        },
      },
    });
    await expect(
      refusal.complete({ operation: 'refusal', input: null }, z.object({ ok: z.boolean() }))
    ).rejects.toThrow('refused');
    expect(refusalCalls).toBe(1);

    let failedCalls = 0;
    const logger = new MemoryLogger();
    const failed = new OpenAIProvider({
      ...options,
      logger,
      transport: {
        complete: async () => {
          failedCalls += 1;
          throw Object.assign(new Error('token=secret'), { status: 400 });
        },
      },
    });
    await expect(
      failed.complete({ operation: 'bad-request', input: null }, z.object({ ok: z.boolean() }))
    ).rejects.toThrow('provider request failed');
    expect(failedCalls).toBe(1);
    expect(logger.entries[0]?.fields).toEqual(
      expect.objectContaining({ error: 'token=[REDACTED]' })
    );
    await failed.close();
    await expect(
      failed.complete({ operation: 'closed', input: null }, z.object({ ok: z.boolean() }))
    ).rejects.toThrow('closed');
  });
});

describe('GovernedProvider', () => {
  it('attributes usage, enforces rate limits, and opens a circuit on transport failures', async () => {
    const governedOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      timeoutMs: 1000,
      maxRetries: 0,
      retryBaseMs: 1,
      promptCostPerMillionUsd: 1,
      completionCostPerMillionUsd: 2,
    };
    let now = 0;
    const clock = { now: () => new Date(now) };
    const response: OpenAITransportResponse = {
      id: 'governed-response',
      model: 'test-model',
      parsed: { value: 1 },
      usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
    };
    const inner = new OpenAIProvider({
      ...governedOptions,
      transport: { complete: async () => response },
    });
    const governed = new GovernedProvider(inner, {
      clock,
      maxRequestsPerMinute: 1,
      circuitFailureThreshold: 2,
      circuitCooldownMs: 10,
    });
    await governed.complete(
      { operation: 'value', input: null, taskId: '00000000-0000-4000-8000-000000000003' },
      z.object({ value: z.number() })
    );
    expect(governed.getTaskUsage('00000000-0000-4000-8000-000000000003').totalTokens).toBe(5);
    await expect(
      governed.complete({ operation: 'limited', input: null }, z.object({ value: z.number() }))
    ).rejects.toThrow('rate limit');

    const failing = new GovernedProvider(
      new OpenAIProvider({
        ...governedOptions,
        transport: {
          complete: async () => {
            throw { status: 503 };
          },
        },
      }),
      { clock, circuitFailureThreshold: 1, circuitCooldownMs: 10 }
    );
    await expect(
      failing.complete({ operation: 'fail', input: null }, z.object({ value: z.number() }))
    ).rejects.toThrow('provider request failed');
    await expect(
      failing.complete({ operation: 'open', input: null }, z.object({ value: z.number() }))
    ).rejects.toThrow('circuit is open');
    now = 11;
    await expect(
      failing.complete({ operation: 'probe', input: null }, z.object({ value: z.number() }))
    ).rejects.toThrow('provider request failed');
    const expensive = new GovernedProvider(
      new OpenAIProvider({
        ...governedOptions,
        transport: {
          complete: async () => ({
            id: 'expensive',
            model: 'test-model',
            parsed: { value: 1 },
            usage: { prompt_tokens: 1000, completion_tokens: 1000, total_tokens: 2000 },
          }),
        },
      }),
      { budgetUsd: 0.000001 }
    );
    await expect(
      expensive.complete({ operation: 'expensive', input: null }, z.object({ value: z.number() }))
    ).rejects.toThrow('budget');
  });

  it('rejects invalid limits, enforces budgets, and reopens a cooled circuit', async () => {
    expect(
      () => new GovernedProvider(new DeterministicProvider(), { circuitFailureThreshold: 0 })
    ).toThrow('governance limits');
    const budget = new GovernedProvider(new DeterministicProvider(), { budgetUsd: 0 });
    await expect(
      budget.complete(
        { operation: 'budget', input: null, localDerivation: () => ({ value: 1 }) },
        z.object({ value: z.number() })
      )
    ).rejects.toThrow('budget');
    const unused = new GovernedProvider(new DeterministicProvider());
    expect(unused.getTaskUsage('missing')).toEqual({
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      costUsd: 0,
    });
    await unused.close();
    expect(unused.isOpen()).toBe(false);
  });

  it('rejects invalid estimated request costs before execution', async () => {
    const request = {
      operation: 'invalid-estimate',
      input: null,
      localDerivation: () => ({ value: 1 }),
    };
    const invalid = new GovernedProvider(new DeterministicProvider(), {
      budgetUsd: 1,
      estimateRequestCost: () => Number.NaN,
    });
    await expect(invalid.complete(request, z.object({ value: z.number() }))).rejects.toThrow(
      'estimate'
    );
    const negative = new GovernedProvider(new DeterministicProvider(), {
      budgetUsd: 1,
      estimateRequestCost: () => -1,
    });
    await expect(negative.complete(request, z.object({ value: z.number() }))).rejects.toThrow(
      'estimate'
    );
  });

  it('allows a later half-open probe after a non-transport failure', async () => {
    let now = 0;
    let calls = 0;
    const inner = new OpenAIProvider({
      apiKey: 'test-key',
      model: 'test-model',
      timeoutMs: 1000,
      maxRetries: 0,
      retryBaseMs: 1,
      promptCostPerMillionUsd: 1,
      completionCostPerMillionUsd: 2,
      transport: {
        complete: async () => {
          calls += 1;
          if (calls === 1) throw { status: 503 };
          if (calls === 2)
            return { id: 'refused', model: 'test-model', parsed: null, refusal: 'policy' };
          return { id: 'recovered', model: 'test-model', parsed: { value: 1 } };
        },
      },
    });
    const governed = new GovernedProvider(inner, {
      clock: { now: () => new Date(now) },
      circuitFailureThreshold: 1,
      circuitCooldownMs: 10,
    });

    await expect(
      governed.complete({ operation: 'fail', input: null }, z.object({ value: z.number() }))
    ).rejects.toThrow('provider request failed');
    now = 11;
    await expect(
      governed.complete({ operation: 'refused', input: null }, z.object({ value: z.number() }))
    ).rejects.toThrow('refused');
    now = 22;
    await expect(
      governed.complete({ operation: 'recover', input: null }, z.object({ value: z.number() }))
    ).resolves.toEqual(expect.objectContaining({ requestId: 'recovered' }));
    expect(calls).toBe(3);
  });

  it('reserves concurrent budget before network calls begin', async () => {
    let release!: () => void;
    const pending = new Promise<OpenAITransportResponse>(resolve => {
      release = () => resolve({ id: 'reserved', model: 'test-model', parsed: { value: 1 } });
    });
    const inner = new OpenAIProvider({
      apiKey: 'test-key',
      model: 'test-model',
      timeoutMs: 1000,
      maxRetries: 0,
      retryBaseMs: 1,
      promptCostPerMillionUsd: 1,
      completionCostPerMillionUsd: 2,
      transport: { complete: async () => pending },
    });
    const governed = new GovernedProvider(inner, {
      budgetUsd: 1,
      estimateRequestCost: () => 0.75,
    });
    const first = governed.complete(
      { operation: 'first', input: null },
      z.object({ value: z.number() })
    );
    await expect(
      governed.complete({ operation: 'second', input: null }, z.object({ value: z.number() }))
    ).rejects.toThrow('budget');
    release();
    await first;
  });
});
