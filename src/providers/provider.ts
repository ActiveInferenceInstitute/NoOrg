import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { ZodType } from 'zod';
import { NoOrgError } from '../domain/errors';
import type {
  CompletionRequest,
  CompletionResponse,
  ProviderKind,
  UsageMetadata,
} from '../domain/types';
import type { Logger } from '../logging/logger';
import { delay } from '../domain/clock';

export interface LLMProvider {
  readonly kind: ProviderKind;
  isOpen(): boolean;
  getUsage(): UsageMetadata;
  complete<T>(
    request: CompletionRequest<T>,
    schema: ZodType<T>,
    signal?: AbortSignal
  ): Promise<CompletionResponse<T>>;
  close(): Promise<void>;
}

export class DeterministicProvider implements LLMProvider {
  public readonly kind = 'local' as const;
  private closed = false;

  public isOpen(): boolean {
    return !this.closed;
  }

  public getUsage(): UsageMetadata {
    return { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };
  }

  public async complete<T>(
    request: CompletionRequest<T>,
    schema: ZodType<T>,
    signal?: AbortSignal
  ): Promise<CompletionResponse<T>> {
    if (this.closed) throw new NoOrgError('PROVIDER_CLOSED', 'Local provider is closed');
    if (signal?.aborted)
      throw new NoOrgError('PROVIDER_ABORTED', 'Local provider request was cancelled', true);
    if (!request.localDerivation)
      throw new NoOrgError(
        'LOCAL_DERIVATION_REQUIRED',
        'Local provider requires a deterministic derivation'
      );
    const data = schema.parse(request.localDerivation());
    return {
      data,
      provider: this.kind,
      model: 'deterministic-local',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
    };
  }

  public async close(): Promise<void> {
    this.closed = true;
  }
}

export interface OpenAIProviderOptions {
  readonly apiKey: string;
  readonly model: string;
  readonly baseUrl?: string;
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly retryBaseMs: number;
  readonly promptCostPerMillionUsd: number;
  readonly completionCostPerMillionUsd: number;
  readonly logger?: Logger;
}

export class OpenAIProvider implements LLMProvider {
  public readonly kind = 'openai' as const;
  private readonly client: OpenAI;
  private readonly logger: Logger | undefined;
  private closed = false;
  private usageTotals: UsageMetadata = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    costUsd: 0,
  };

  public isOpen(): boolean {
    return !this.closed;
  }

  public getUsage(): UsageMetadata {
    return { ...this.usageTotals };
  }

  public constructor(private readonly options: OpenAIProviderOptions) {
    if (!options.apiKey.trim())
      throw new NoOrgError('PROVIDER_CREDENTIALS_MISSING', 'OpenAI API key is required');
    this.logger = options.logger;
    this.client = new OpenAI({
      apiKey: options.apiKey,
      ...(options.baseUrl === undefined ? {} : { baseURL: options.baseUrl }),
      timeout: options.timeoutMs,
      maxRetries: 0,
    });
  }

  public async complete<T>(
    request: CompletionRequest<T>,
    schema: ZodType<T>,
    signal?: AbortSignal
  ): Promise<CompletionResponse<T>> {
    if (this.closed) throw new NoOrgError('PROVIDER_CLOSED', 'OpenAI provider is closed');
    if (signal?.aborted)
      throw new NoOrgError('PROVIDER_ABORTED', 'OpenAI request was cancelled', true);
    for (let attempt = 0; attempt <= this.options.maxRetries; attempt += 1) {
      try {
        return await this.completeOnce(request, schema, signal);
      } catch (error) {
        const normalized = this.normalizeError(error);
        if (!normalized.retryable || attempt >= this.options.maxRetries) throw normalized;
        await delay(this.options.retryBaseMs * 2 ** attempt, signal);
      }
    }
    throw new NoOrgError('PROVIDER_REQUEST_FAILED', 'OpenAI provider request failed', true);
  }

  public async close(): Promise<void> {
    this.closed = true;
  }

  private async completeOnce<T>(
    request: CompletionRequest<T>,
    schema: ZodType<T>,
    signal?: AbortSignal
  ): Promise<CompletionResponse<T>> {
    const controller = new AbortController();
    const onAbort = (): void => controller.abort();
    signal?.addEventListener('abort', onAbort, { once: true });
    try {
      const response = await this.client.beta.chat.completions.parse(
        {
          model: request.model ?? this.options.model,
          messages: [
            {
              role: 'system',
              content:
                request.system ?? 'Return a structured result matching the requested schema.',
            },
            {
              role: 'user',
              content: JSON.stringify({ operation: request.operation, input: request.input }),
            },
          ],
          response_format: zodResponseFormat(schema, 'noorg_result'),
          ...(request.maxTokens === undefined ? {} : { max_tokens: request.maxTokens }),
          ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
        },
        { signal: controller.signal }
      );
      const parsed = response.choices[0]?.message.parsed;
      if (parsed === null || parsed === undefined)
        throw new NoOrgError(
          'PROVIDER_INVALID_OUTPUT',
          'OpenAI returned no schema-validated result',
          true
        );
      const data = schema.parse(parsed);
      const usage = response.usage;
      const promptTokens = usage?.prompt_tokens ?? 0;
      const completionTokens = usage?.completion_tokens ?? 0;
      const metadata: UsageMetadata = {
        promptTokens,
        completionTokens,
        totalTokens: usage?.total_tokens ?? promptTokens + completionTokens,
        costUsd:
          (promptTokens / 1_000_000) * this.options.promptCostPerMillionUsd +
          (completionTokens / 1_000_000) * this.options.completionCostPerMillionUsd,
      };
      this.usageTotals = {
        promptTokens: this.usageTotals.promptTokens + metadata.promptTokens,
        completionTokens: this.usageTotals.completionTokens + metadata.completionTokens,
        totalTokens: this.usageTotals.totalTokens + metadata.totalTokens,
        costUsd: this.usageTotals.costUsd + metadata.costUsd,
      };
      return {
        data,
        provider: this.kind,
        model: response.model,
        usage: metadata,
        requestId: response.id,
      };
    } finally {
      signal?.removeEventListener('abort', onAbort);
    }
  }

  private normalizeError(error: unknown): NoOrgError {
    if (error instanceof NoOrgError) return error;
    this.logger?.error('OpenAI provider request failed', {
      operation: 'completion',
      error: error instanceof Error ? error.message : 'unknown provider failure',
    });
    return new NoOrgError('PROVIDER_REQUEST_FAILED', 'OpenAI provider request failed', true);
  }
}
