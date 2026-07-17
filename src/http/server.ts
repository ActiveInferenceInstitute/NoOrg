import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { Coordinator } from '../coordination/coordinator';

export interface HttpAppOptions {
  readonly coordinator: Coordinator;
  readonly metricsEnabled: boolean;
}

export function createHttpServer(options: HttpAppOptions): Server {
  return createServer((request, response) => handleRequest(request, response, options));
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  options: HttpAppOptions
): Promise<void> {
  response.setHeader('content-type', 'application/json; charset=utf-8');
  const path = request.url?.split('?')[0] ?? '/';
  if (request.method === 'GET' && path === '/health') {
    const health = options.coordinator.getHealth();
    write(response, health.status === 'stopped' ? 503 : 200, {
      status: health.status === 'stopped' ? 'failed' : 'ok',
      coordinator: health.status,
      provider: health.provider,
      agents: health.agents,
      activeTasks: health.activeTasks,
      stateRevision: health.stateRevision,
      providerReady: health.providerReady,
      stateReady: health.stateReady,
      registryReady: health.registryReady,
      usage: health.usage,
    });
    return;
  }
  if (request.method === 'GET' && path === '/ready') {
    const health = options.coordinator.getHealth();
    const ready =
      health.status === 'running' &&
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
  write(response, path === '/metrics' ? 404 : 404, { error: 'NOT_FOUND' });
}

function write(response: ServerResponse, statusCode: number, body: unknown): void {
  response.statusCode = statusCode;
  response.end(JSON.stringify(body));
}
