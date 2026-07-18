import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const source = readFileSync(resolve(root, 'src/domain/types.ts'), 'utf8');
const coordinator = readFileSync(resolve(root, 'src/coordination/coordinator.ts'), 'utf8');
const http = readFileSync(resolve(root, 'src/http/server.ts'), 'utf8');
const readme = readFileSync(resolve(root, 'README.md'), 'utf8');
const configuration = readFileSync(resolve(root, 'docs/configuration.md'), 'utf8');
const appendix = readFileSync(resolve(root, 'docs/manuscript/08_appendix_contracts.md'), 'utf8');
const architecture = readFileSync(resolve(root, 'docs/manuscript/03_architecture.md'), 'utf8');
const openapiPath = resolve(root, 'docs/api/openapi.json');
const violations: string[] = [];
let openapi: { openapi?: string; paths?: Record<string, Record<string, unknown>> } | undefined;
try {
  openapi = JSON.parse(readFileSync(openapiPath, 'utf8')) as typeof openapi;
} catch {
  violations.push('generated OpenAPI description is missing or invalid');
}

if (!source.includes('schemaVersion: z.literal(2)'))
  violations.push('runtime state schema version is not declared as two');
if (!source.includes('export const taskRequestSchema'))
  violations.push('task request schema is not exported');
if (!source.includes('export const taskQuerySchema'))
  violations.push('task query schema is not exported');
for (const method of ['start', 'submitTask', 'cancelTask', 'getTask', 'listTasks', 'shutdown']) {
  if (!coordinator.includes(`${method}(`))
    violations.push(`scheduler method is missing: ${method}`);
  if (!appendix.includes(`${method}()`))
    violations.push(`manuscript contract omits scheduler method: ${method}`);
}
const routes: Record<string, string> = {
  'POST /v1/tasks': "request.method === 'POST' && path === '/v1/tasks'",
  'GET /v1/tasks': "request.method === 'GET' && path === '/v1/tasks'",
  'GET /v1/tasks/:id': "request.method === 'GET' && taskId !== undefined",
  'POST /v1/tasks/:id/cancel': "request.method === 'POST' && cancelTaskId !== undefined",
};
for (const [route, marker] of Object.entries(routes)) {
  if (!http.includes(marker)) violations.push(`HTTP route is absent: ${route}`);
  if (!readme.includes(route)) violations.push(`README omits HTTP route: ${route}`);
}
const openapiRoutes: Record<string, string> = {
  '/v1/tasks|post': 'POST /v1/tasks',
  '/v1/tasks|get': 'GET /v1/tasks',
  '/v1/tasks/{id}|get': 'GET /v1/tasks/:id',
  '/v1/tasks/{id}/cancel|post': 'POST /v1/tasks/:id/cancel',
};
if (openapi?.openapi !== '3.0.3') violations.push('OpenAPI description has the wrong version');
for (const [key, route] of Object.entries(openapiRoutes)) {
  const [path, method] = key.split('|') as [string, string];
  if (openapi?.paths?.[path]?.[method] === undefined)
    violations.push(`OpenAPI description omits ${route}`);
}
for (const variable of [
  'NOORG_HTTP_AUTH_TOKEN',
  'NOORG_PROVIDER_BUDGET_USD',
  'NOORG_PROVIDER_MAX_REQUESTS_PER_MINUTE',
  'NOORG_AGENT_MODULES',
  'NOORG_AGENT_MODULE_TRUSTED_SHA256',
  'NOORG_MAX_WORKFLOW_DEPTH',
  'NOORG_MAX_WORKFLOW_CHILDREN',
]) {
  if (!configuration.includes(variable))
    violations.push(`configuration reference omits ${variable}`);
}
if (!architecture.includes('reviewed manifest') || !architecture.includes('contract version'))
  violations.push('manuscript architecture omits explicit extension boundaries');
if (!existsSync(resolve(root, 'units/manifest.json')))
  violations.push('unit integrity manifest is missing');
if (!existsSync(openapiPath)) violations.push('generated OpenAPI description is missing');

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.info('Contract and documentation consistency validation passed.');
}
