export class NoOrgError extends Error {
  public constructor(
    public readonly code: string,
    message: string,
    public readonly retryable = false,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'NoOrgError';
  }
}

export function toTaskError(error: unknown): {
  code: string;
  message: string;
  retryable: boolean;
  details?: JsonValue;
} {
  if (error instanceof NoOrgError) {
    const details = jsonValueSchema.safeParse(error.details);
    return {
      code: error.code,
      message: error.message,
      retryable: error.retryable,
      ...(details.success ? { details: details.data } : {}),
    };
  }
  if (error instanceof Error) {
    return { code: 'TASK_EXECUTION_FAILED', message: error.message, retryable: false };
  }
  return { code: 'TASK_EXECUTION_FAILED', message: String(error), retryable: false };
}

export function assertCondition(
  condition: unknown,
  code: string,
  message: string
): asserts condition {
  if (!condition) {
    throw new NoOrgError(code, message);
  }
}
import { jsonValueSchema, type JsonValue } from './types';
