export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  public now(): Date {
    return new Date();
  }
}

export function delay(milliseconds: number, signal?: AbortSignal): Promise<void> {
  if (milliseconds <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', abort);
      resolve();
    }, milliseconds);
    const abort = (): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      reject(new DOMException('Operation aborted', 'AbortError'));
    };
    if (signal?.aborted) {
      abort();
      return;
    }
    signal?.addEventListener('abort', abort, { once: true });
  });
}

export class NoOrgTimeoutError extends Error {
  public constructor(milliseconds: number) {
    super(`Operation exceeded ${milliseconds}ms`);
    this.name = 'NoOrgTimeoutError';
  }
}
