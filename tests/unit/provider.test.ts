import { z } from 'zod';
import { DeterministicProvider } from '../../src/providers/provider';

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
});
