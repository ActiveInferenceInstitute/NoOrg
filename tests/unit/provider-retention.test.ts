import { z } from 'zod';
import { GovernedProvider } from '../../src/providers/governed-provider';
import { DeterministicProvider } from '../../src/providers/provider';

const schema = z.object({ value: z.number() });
const request = {
  operation: 'local-retention',
  input: null,
  localDerivation: () => ({ value: 1 }),
};
const invalidRequest = { ...request, localDerivation: () => ({ value: Number.NaN }) };

describe('GovernedProvider rate-history ownership', () => {
  it('retains no rate history when explicitly disabled, across successful and failed local requests', async () => {
    const provider = new GovernedProvider(new DeterministicProvider(), {
      maxRequestsPerMinute: 0,
      circuitFailureThreshold: 1000,
    });
    try {
      for (let index = 0; index < 128; index += 1) {
        expect((await provider.complete(request, schema)).data).toEqual({ value: 1 });
        await expect(provider.complete(invalidRequest, schema)).rejects.toThrow();
      }
      // This is the retained-memory contract, not a timing/heap-size heuristic.
      const history = z.array(z.number()).parse(Reflect.get(provider, 'requestTimes'));
      expect(history).toEqual([]);
      expect(provider.getUsage()).toEqual({
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        costUsd: 0,
      });
    } finally {
      await provider.close();
    }
  });

  it('counts enabled failed attempts, rejects excess requests, and expires the exact rolling boundary', async () => {
    let now = 0;
    const provider = new GovernedProvider(new DeterministicProvider(), {
      maxRequestsPerMinute: 2,
      circuitFailureThreshold: 1000,
      clock: { now: () => new Date(now) },
    });
    try {
      await provider.complete(request, schema);
      await expect(provider.complete(invalidRequest, schema)).rejects.toThrow();
      await expect(provider.complete(request, schema)).rejects.toMatchObject({
        code: 'PROVIDER_RATE_LIMITED',
      });
      now = 59_999;
      await expect(provider.complete(request, schema)).rejects.toMatchObject({
        code: 'PROVIDER_RATE_LIMITED',
      });
      now = 60_000;
      expect((await provider.complete(request, schema)).data).toEqual({ value: 1 });
      for (let window = 0; window < 32; window += 1) {
        now += 60_000;
        await provider.complete(request, schema);
        await provider.complete(request, schema);
        await expect(provider.complete(request, schema)).rejects.toMatchObject({
          code: 'PROVIDER_RATE_LIMITED',
        });
        const history = z.array(z.number()).parse(Reflect.get(provider, 'requestTimes'));
        expect(history).toEqual([now, now]);
      }
    } finally {
      await provider.close();
    }
  });
});
