import { z } from 'zod';
import { OpenAIProvider } from '../../src/providers/provider';

const enabled = process.env.NOORG_LLM_PROVIDER === 'openai' && Boolean(process.env.OPENAI_API_KEY);
if (process.env.NOORG_LLM_PROVIDER === 'openai' && !process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required when the live provider suite is explicitly selected');
}
const describeLive = enabled ? describe : describe.skip;

describeLive('OpenAI live validation', () => {
  it('returns schema-valid structured output', async () => {
    const provider = new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY!,
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      timeoutMs: 30000,
      maxRetries: 1,
      retryBaseMs: 250,
      promptCostPerMillionUsd: 0,
      completionCostPerMillionUsd: 0,
    });
    const response = await provider.complete(
      {
        operation: 'live-contract',
        input: { request: 'Return the number seven.' },
        system: 'Return JSON with a numeric value field.',
        localDerivation: () => ({ value: 7 }),
      },
      z.object({ value: z.number() })
    );
    expect(response.data.value).toEqual(expect.any(Number));
    await provider.close();
  }, 40000);
});
