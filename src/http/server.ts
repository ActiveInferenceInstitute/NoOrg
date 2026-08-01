import { randomUUID, timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { NoOrgError } from '../domain/errors';
import { taskQuerySchema, taskRequestSchema, type TaskQuery } from '../domain/types';
import type { Coordinator } from '../coordination/coordinator';

export interface HttpAppOptions {
  readonly coordinator: Coordinator;
  readonly metricsEnabled: boolean;
  readonly authToken?: string;
  readonly maxBodyBytes?: number;
  readonly maxInFlightRequests?: number;
  readonly authFailureThreshold?: number;
  readonly authFailureWindowMs?: number;
}

const defaultBodyLimit = 1_048_576;
const defaultMaxInFlightRequests = 100;
const defaultAuthFailureThreshold = 20;
const defaultAuthFailureWindowMs = 60_000;
const headersTimeoutMs = 10_000;
const requestTimeoutMs = 30_000;
const keepAliveTimeoutMs = 5_000;

export function isBearerAuthorized(authorization: string | undefined, token: string): boolean {
  const expected = `Bearer ${token}`;
  if (authorization === undefined || authorization.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(authorization), Buffer.from(expected));
}

interface AuthEntry {
  readonly count: number;
  readonly resetAt: number;
}

export class AuthThrottle {
  private readonly counts = new Map<string, AuthEntry>();

  public constructor(
    private readonly threshold: number,
    private readonly windowMs: number,
    private readonly clock: () => number = Date.now
  ) {
    if (threshold < 1 || windowMs < 1)
      throw new NoOrgError('INVALID_AUTH_LIMITS', 'Invalid auth limits');
  }

  public record(ip: string): boolean {
    this.prune();
    const now = this.clock();
    const previous = this.counts.get(ip);
    const entry: AuthEntry =
      previous === undefined || previous.resetAt <= now
        ? { count: 1, resetAt: now + this.windowMs }
        : { count: previous.count + 1, resetAt: previous.resetAt };
    this.counts.set(ip, entry);
    return entry.count >= this.threshold;
  }

  public isLimited(ip: string): boolean {
    this.prune();
    const entry = this.counts.get(ip);
    return entry !== undefined && entry.count >= this.threshold && entry.resetAt > this.clock();
  }

  public reset(ip: string): void {
    this.counts.delete(ip);
  }

  private prune(): void {
    const now = this.clock();
    for (const [ip, entry] of this.counts) {
      if (entry.resetAt <= now) this.counts.delete(ip);
    }
  }
}

interface RequestContext {
  readonly inFlightRequests: number;
  readonly maxInFlightRequests: number;
  readonly authThrottle: AuthThrottle;
}

export function createHttpServer(options: HttpAppOptions): Server {
  const maxInFlightRequests = options.maxInFlightRequests ?? defaultMaxInFlightRequests;
  const authThrottle = new AuthThrottle(
    options.authFailureThreshold ?? defaultAuthFailureThreshold,
    options.authFailureWindowMs ?? defaultAuthFailureWindowMs
  );
  let inFlight = 0;
  const server = createServer((request, response) => {
    inFlight += 1;
    const context: RequestContext = {
      inFlightRequests: inFlight,
      maxInFlightRequests,
      authThrottle,
    };
    void handleRequest(request, response, options, context)
      .catch(error => {
        const requestId = response.getHeader('x-request-id')?.toString() ?? randomUUID();
        const mapped = mapHttpError(error);
        if (!response.headersSent) response.setHeader('x-request-id', requestId);
        if (!response.writableEnded)
          writeError(response, mapped.status, mapped.code, mapped.message, requestId);
        options.coordinator.getMetrics().increment('http_internal_errors');
      })
      .finally(() => {
        inFlight -= 1;
      });
  });
  server.headersTimeout = headersTimeoutMs;
  server.requestTimeout = requestTimeoutMs;
  server.keepAliveTimeout = keepAliveTimeoutMs;
  return server;
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  options: HttpAppOptions,
  context: RequestContext
): Promise<void> {
  const requestId = requestIdFrom(request);
  response.setHeader('x-request-id', requestId);
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('cache-control', 'no-store');
  if (context.inFlightRequests > context.maxInFlightRequests) {
    writeError(response, 503, 'SERVER_BUSY', 'Too many concurrent requests', requestId);
    return;
  }
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const path = url.pathname;

  if (path.startsWith('/v1/') || path === '/metrics') {
    const authorization = request.headers.authorization;
    const client = request.socket.remoteAddress ?? 'unknown';
    const authorized =
      options.authToken === undefined || isBearerAuthorized(authorization, options.authToken);
    if (!authorized) {
      if (context.authThrottle.record(client)) {
        writeError(
          response,
          429,
          'AUTH_RATE_LIMITED',
          'Too many authentication failures',
          requestId
        );
        return;
      }
      response.setHeader('www-authenticate', 'Bearer');
      writeError(response, 401, 'UNAUTHORIZED', 'Authentication is required', requestId);
      return;
    }
    if (options.authToken !== undefined) context.authThrottle.reset(client);
  }

  if (request.method === 'GET' && path === '/health') {
    const health = options.coordinator.getHealth();
    write(response, health.status === 'stopped' ? 503 : 200, {
      status: health.status === 'stopped' ? 'failed' : 'ok',
      coordinator: health.status,
      provider: health.provider,
      agents: health.agents,
      activeTasks: health.activeTasks,
      queueDepth: health.queueDepth,
      blockedTasks: health.blockedTasks,
      blockedCapabilityTasks: health.blockedCapabilityTasks,
      blockedCapacityTasks: health.blockedCapacityTasks,
      stateRevision: health.stateRevision,
      providerReady: health.providerReady,
      stateReady: health.stateReady,
      registryReady: health.registryReady,
      shutdownTimedOut: health.shutdownTimedOut,
      ...(health.lastFailure === undefined ? {} : { lastFailure: health.lastFailure }),
      usage: health.usage,
    });
    return;
  }
  if (request.method === 'GET' && path === '/ready') {
    const health = options.coordinator.getHealth();
    const ready =
      health.status === 'running' &&
      !health.shutdownTimedOut &&
      health.agents > 0 &&
      health.providerReady &&
      health.stateReady &&
      health.registryReady;
    write(response, ready ? 200 : 503, { ready });
    return;
  }
  if (request.method === 'GET' && path === '/metrics' && options.metricsEnabled) {
    response.setHeader('content-type', 'text/plain; version=0.0.4; charset=utf-8');
    response.statusCode = 200;
    response.end(options.coordinator.getMetrics().renderPrometheus());
    return;
  }

  const taskId = path.match(/^\/v1\/tasks\/([^/]+)$/)?.[1];
  const cancelTaskId = path.match(/^\/v1\/tasks\/([^/]+)\/cancel$/)?.[1];
  if (request.method === 'POST' && path === '/v1/tasks') {
    if (!isJsonRequest(request)) {
      writeError(response, 415, 'UNSUPPORTED_MEDIA_TYPE', 'Expected application/json', requestId);
      return;
    }
    const body = await readBody(request, options.maxBodyBytes ?? defaultBodyLimit);
    const parsed = taskRequestSchema.parse(JSON.parse(body));
    const task = await options.coordinator.submitTask({
      name: parsed.name,
      description: parsed.description,
      input: parsed.input,
      ...(parsed.agentId === undefined ? {} : { agentId: parsed.agentId }),
      requiredCapabilities: parsed.requiredCapabilities,
      priority: parsed.priority,
      priorityPolicy: parsed.priorityPolicy,
      timeoutMs: parsed.timeoutMs,
      maxAttempts: parsed.maxAttempts,
      retryBackoffMs: parsed.retryBackoffMs,
      ...(parsed.deadlineAt === undefined ? {} : { deadlineAt: parsed.deadlineAt }),
      ...(parsed.idempotencyKey === undefined ? {} : { idempotencyKey: parsed.idempotencyKey }),
      ...(parsed.parentTaskId === undefined ? {} : { parentTaskId: parsed.parentTaskId }),
      parentCompletionPolicy: parsed.parentCompletionPolicy,
      dependencyIds: parsed.dependencyIds,
    });
    write(response, 202, task);
    return;
  }
  if (request.method === 'GET' && path === '/v1/tasks') {
    const query = parseTaskQuery(url.searchParams);
    if (!query.success) {
      writeError(
        response,
        400,
        'INVALID_TASK_QUERY',
        'Task query parameters are invalid',
        requestId
      );
      return;
    }
    write(response, 200, options.coordinator.listTasks(query.data.status, query.data as TaskQuery));
    return;
  }
  if (request.method === 'GET' && taskId !== undefined) {
    const task = options.coordinator.getTask(taskId);
    if (!task) {
      writeError(response, 404, 'TASK_NOT_FOUND', 'Task was not found', requestId);
      return;
    }
    write(response, 200, task);
    return;
  }
  if (request.method === 'POST' && cancelTaskId !== undefined) {
    const task = await options.coordinator.cancelTask(cancelTaskId);
    write(response, 200, task);
    return;
  }

  writeError(response, 404, 'NOT_FOUND', 'Route was not found', requestId);
}

function requestIdFrom(request: IncomingMessage): string {
  const supplied = request.headers['x-request-id'];
  if (typeof supplied === 'string' && /^[A-Za-z0-9._-]{1,100}$/.test(supplied)) return supplied;
  return randomUUID();
}

function isJsonRequest(request: IncomingMessage): boolean {
  const contentType = request.headers['content-type'];
  return (
    typeof contentType === 'string' && contentType.toLowerCase().startsWith('application/json')
  );
}

function parseTaskQuery(searchParams: URLSearchParams) {
  const value: Record<string, string | number> = {};
  for (const name of ['status', 'agentId', 'capability', 'idempotencyKey'] as const) {
    const item = searchParams.get(name);
    if (item !== null) value[name] = item;
  }
  for (const name of ['limit', 'offset'] as const) {
    const item = searchParams.get(name);
    if (item !== null) value[name] = Number(item);
  }
  return taskQuerySchema.safeParse(value);
}

function readBody(request: IncomingMessage, maxBytes: number): Promise<string> {
  const contentLength = Number(request.headers['content-length']);
  if (Number.isFinite(contentLength) && contentLength > maxBytes)
    return Promise.reject(
      new NoOrgError('REQUEST_TOO_LARGE', 'Request body exceeds the size limit')
    );
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks: string[] = [];
    request.setEncoding('utf8');
    request.on('data', (chunk: string) => {
      total += Buffer.byteLength(chunk, 'utf8');
      if (total > maxBytes) {
        reject(new NoOrgError('REQUEST_TOO_LARGE', 'Request body exceeds the size limit'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(chunks.join('')));
    request.on('error', reject);
    request.on('aborted', () => reject(new NoOrgError('REQUEST_ABORTED', 'Request was aborted')));
  });
}

function write(response: ServerResponse, statusCode: number, body: unknown): void {
  response.statusCode = statusCode;
  response.end(JSON.stringify(body));
}

function writeError(
  response: ServerResponse,
  statusCode: number,
  code: string,
  message: string,
  requestId: string
): void {
  write(response, statusCode, { error: { code, message, requestId } });
}

function mapHttpError(error: unknown): {
  readonly status: number;
  readonly code: string;
  readonly message: string;
} {
  if (error instanceof NoOrgError) {
    const status =
      error.code === 'TASK_NOT_FOUND'
        ? 404
        : error.code === 'REQUEST_TOO_LARGE'
          ? 413
          : error.code === 'INVALID_TASK_TRANSITION'
            ? 409
            : error.code === 'IDEMPOTENCY_CONFLICT' || error.code === 'TASK_DEPENDENCY_CYCLE'
              ? 409
              : error.code === 'TASK_PARENT_NOT_FOUND' || error.code === 'TASK_DEPENDENCY_NOT_FOUND'
                ? 404
                : error.code === 'COORDINATOR_NOT_RUNNING'
                  ? 503
                  : error.code.startsWith('INVALID_') ||
                      error.code === 'TASK_DEADLINE_INVALID' ||
                      error.code.endsWith('_TOO_LARGE')
                    ? 400
                    : error.code.startsWith('PROVIDER_')
                      ? 502
                      : 500;
    return { status, code: error.code, message: error.message };
  }
  if (error instanceof SyntaxError) {
    return { status: 400, code: 'INVALID_JSON', message: 'Request body is not valid JSON' };
  }
  if (error instanceof Error && error.name === 'ZodError') {
    return {
      status: 400,
      code: 'INVALID_REQUEST',
      message: 'Request does not match the task schema',
    };
  }
  return { status: 500, code: 'INTERNAL_ERROR', message: 'The request could not be completed' };
}
