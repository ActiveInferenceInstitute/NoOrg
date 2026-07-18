export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'NoOrg Task API',
    version: '2.0.0',
    description: 'Versioned task submission and lifecycle API.',
  },
  servers: [{ url: '/' }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer' },
    },
    schemas: {
      TaskRequest: {
        type: 'object',
        required: ['name', 'description', 'input'],
        additionalProperties: false,
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string', minLength: 1 },
          input: {},
          agentId: { type: 'string' },
          requiredCapabilities: { type: 'array', items: { type: 'string' } },
          priority: { type: 'number' },
          priorityPolicy: { type: 'string', enum: ['fixed', 'inherit_max'] },
          timeoutMs: { type: 'integer', minimum: 100 },
          maxAttempts: { type: 'integer', minimum: 1 },
          retryBackoffMs: { type: 'integer', minimum: 0 },
          deadlineAt: { type: 'string', format: 'date-time' },
          idempotencyKey: { type: 'string', maxLength: 255 },
          parentTaskId: { type: 'string', format: 'uuid' },
          parentCompletionPolicy: {
            type: 'string',
            enum: ['independent', 'wait_for_success'],
          },
          dependencyIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
        },
      },
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message', 'requestId'],
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              requestId: { type: 'string' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/v1/tasks': {
      post: {
        operationId: 'createTask',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskRequest' } } },
        },
        responses: {
          '202': { description: 'Task accepted' },
          '400': { description: 'Invalid request' },
          '409': { description: 'Idempotency or workflow conflict' },
          '503': { description: 'Coordinator unavailable' },
        },
      },
      get: {
        operationId: 'listTasks',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'agentId', in: 'query', schema: { type: 'string' } },
          { name: 'capability', in: 'query', schema: { type: 'string' } },
          { name: 'idempotencyKey', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0 } },
        ],
        responses: {
          '200': { description: 'Task records' },
          '400': { description: 'Invalid query' },
        },
      },
    },
    '/v1/tasks/{id}': {
      get: {
        operationId: 'getTask',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Task record' },
          '404': { description: 'Task not found' },
        },
      },
    },
    '/v1/tasks/{id}/cancel': {
      post: {
        operationId: 'cancelTask',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Cancelled or already-cancelled task' },
          '404': { description: 'Task not found' },
          '409': { description: 'Terminal task conflict' },
        },
      },
    },
  },
} as const;
