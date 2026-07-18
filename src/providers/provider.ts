import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { ZodType } from 'zod';
import { delay } from '../domain/clock';
import { NoOrgError } from '../domain/errors';
import type {
  CompletionRequest,
  CompletionResponse,
  ProviderKind,
  UsageMetadata,
} from '../domain/types';
import { completionRequestSchema } from '../domain/types';
import type { Logger } from '../logging/logger';

export interface LLMProvider {
  readonly kind: ProviderKind;
  isOpen(): boolean;
  getUsage(): UsageMetadata;
  getTaskUsage?(taskId: string): UsageMetadata;
  complete<T>(
    request: CompletionRequest<T>,
    schema: ZodType<T>,
    signal?: AbortSignal
  ): Promise<CompletionResponse<T>>;
  close(): Promise<void>;
}

function validateRequest<T>(request: CompletionRequest<T>): void {
  const { localDerivation: _localDerivation, ...envelope } = request;
  completionRequestSchema.parse(envelope);
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
      throw new NoOrgError('PROVIDER_ABORTED', 'Local provider request was cancelled', false);
    validateRequest(request);
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

export interface OpenAITransportRequest {
  readonly model: string;
  readonly messages: readonly { readonly role: 'system' | 'user'; readonly content: string }[];
  readonly responseFormat: unknown;
  readonly maxTokens?: number;
  readonly temperature?: number;
}

export interface OpenAITransportResponse {
  readonly id: string;
  readonly model: string;
  readonly parsed: unknown;
  readonly refusal?: string | null;
  readonly usage?: {
    readonly prompt_tokens?: number;
    readonly completion_tokens?: number;
    readonly total_tokens?: number;
  };
}

export interface OpenAITransport {
  complete(request: OpenAITransportRequest, signal: AbortSignal): Promise<OpenAITransportResponse>;
}

class SdkOpenAITransport implements OpenAITransport {
  private readonly client: OpenAI;

  public constructor(options: {
    readonly apiKey: string;
    readonly baseUrl?: string;
    readonly timeoutMs: number;
  }) {
    this.client = new OpenAI({
      apiKey: options.apiKey,
      ...(options.baseUrl === undefined ? {} : { baseURL: options.baseUrl }),
      timeout: options.timeoutMs,
      maxRetries: 0,
    });
  }

  public async complete(
    request: OpenAITransportRequest,
    signal: AbortSignal
  ): Promise<OpenAITransportResponse> {
    type ParseRequest = Parameters<OpenAI['beta']['chat']['completions']['parse']>[0];
    const params = {
      model: request.model,
      messages: request.messages,
      response_format: request.responseFormat,
      ...(request.maxTokens === undefined ? {} : { max_tokens: request.maxTokens }),
      ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
    } as ParseRequest;
    const response = await this.client.beta.chat.completions.parse(params, { signal });
    const choice = response.choices[0]?.message;
    return {
      id: response.id,
      model: response.model,
      parsed: choice?.parsed ?? null,
      ...(choice?.refusal === undefined ? {} : { refusal: choice.refusal }),
      ...(response.usage === undefined
        ? {}
        : {
            usage: {
              prompt_tokens: response.usage.prompt_tokens,
              completion_tokens: response.usage.completion_tokens,
              total_tokens: response.usage.total_tokens,
            },
          }),
    };
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
  readonly transport?: OpenAITransport;
}

export class OpenAIProvider implements LLMProvider {
  public readonly kind = 'openai' as const;
  private readonly logger: Logger | undefined;
  private readonly transport: OpenAITransport;
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
    this.transport =
      options.transport ??
      new SdkOpenAITransport({
        apiKey: options.apiKey,
        ...(options.baseUrl === undefined ? {} : { baseUrl: options.baseUrl }),
        timeoutMs: options.timeoutMs,
      });
  }

  public async complete<T>(
    request: CompletionRequest<T>,
    schema: ZodType<T>,
    signal?: AbortSignal
  ): Promise<CompletionResponse<T>> {
    if (this.closed) throw new NoOrgError('PROVIDER_CLOSED', 'OpenAI provider is closed');
    if (signal?.aborted)
      throw new NoOrgError('PROVIDER_ABORTED', 'OpenAI request was cancelled', false);
    validateRequest(request);
    for (let attempt = 0; attempt <= this.options.maxRetries; attempt += 1) {
      try {
        return await this.completeOnce(request, schema, signal);
      } catch (error) {
        const normalized = this.normalizeError(error, signal);
        if (!normalized.retryable || attempt >= this.options.maxRetries) throw normalized;
        try {
          await delay(this.options.retryBaseMs * 2 ** attempt, signal);
        } catch (delayError) {
          throw this.normalizeError(delayError, signal);
        }
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
    if (signal?.aborted) controller.abort();
    const onAbort = (): void => controller.abort();
    signal?.addEventListener('abort', onAbort, { once: true });
    try {
      const response = await this.transport.complete(
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
          responseFormat: zodResponseFormat(schema, 'noorg_result'),
          ...(request.maxTokens === undefined ? {} : { maxTokens: request.maxTokens }),
          ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
        },
        controller.signal
      );
      if (response.refusal)
        throw new NoOrgError('PROVIDER_REFUSED', 'OpenAI refused the structured request', false);
      const parsed = schema.safeParse(response.parsed);
      if (!parsed.success)
        throw new NoOrgError(
          'PROVIDER_INVALID_OUTPUT',
          'OpenAI returned a result that failed schema validation',
          false,
          parsed.error.issues
        );
      const promptTokens = response.usage?.prompt_tokens ?? 0;
      const completionTokens = response.usage?.completion_tokens ?? 0;
      const metadata: UsageMetadata = {
        promptTokens,
        completionTokens,
        totalTokens: response.usage?.total_tokens ?? promptTokens + completionTokens,
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
        data: parsed.data,
        provider: this.kind,
        model: response.model,
        usage: metadata,
        requestId: response.id,
      };
    } finally {
      signal?.removeEventListener('abort', onAbort);
    }
  }

  private normalizeError(error: unknown, signal?: AbortSignal): NoOrgError {
    if (signal?.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
      return new NoOrgError('PROVIDER_ABORTED', 'OpenAI request was cancelled', false);
    }
    if (error instanceof NoOrgError) return error;
    const status =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as { status?: unknown }).status === 'number'
        ? (error as { status: number }).status
        : undefined;
    const retryable = status === 408 || status === 409 || status === 429 || (status ?? 0) >= 500;
    this.logger?.error('OpenAI provider request failed', {
      operation: 'completion',
      status,
      error: error instanceof Error ? error.message : 'unknown provider failure',
    });
    return new NoOrgError('PROVIDER_REQUEST_FAILED', 'OpenAI provider request failed', retryable);
  }
}
