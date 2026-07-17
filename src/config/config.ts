import { z } from 'zod';
import { isAbsolute, relative, resolve } from 'node:path';
import type { ProviderKind } from '../domain/types';

const environmentSchema = z.enum(['development', 'test', 'production']);
const providerSchema = z.enum(['local', 'openai']);

function integer(name: string, fallback: number, minimum: number) {
  return z.preprocess(
    value => (value === undefined || value === '' ? fallback : value),
    z.coerce.number().int().min(minimum, `${name} must be at least ${minimum}`)
  );
}

export interface AppConfig {
  readonly environment: 'development' | 'test' | 'production';
  readonly provider: ProviderKind;
  readonly openai: {
    readonly apiKey?: string;
    readonly model: string;
    readonly baseUrl?: string;
    readonly timeoutMs: number;
    readonly maxRetries: number;
    readonly retryBaseMs: number;
    readonly promptCostPerMillionUsd: number;
    readonly completionCostPerMillionUsd: number;
  };
  readonly server: { readonly port: number };
  readonly statePath: string;
  readonly pollIntervalMs: number;
  readonly maxConcurrentTasks: number;
  readonly defaultTaskTimeoutMs: number;
  readonly metricsEnabled: boolean;
}

const rawSchema = z.object({
  NODE_ENV: environmentSchema.default('development'),
  NOORG_LLM_PROVIDER: providerSchema,
  OPENAI_API_KEY: z.string().trim().min(1).optional(),
  OPENAI_MODEL: z.string().trim().min(1).default('gpt-4o-mini'),
  OPENAI_BASE_URL: z.string().url().optional(),
  OPENAI_TIMEOUT_MS: integer('OPENAI_TIMEOUT_MS', 30000, 1000),
  OPENAI_MAX_RETRIES: integer('OPENAI_MAX_RETRIES', 2, 0),
  OPENAI_RETRY_BASE_MS: integer('OPENAI_RETRY_BASE_MS', 250, 50),
  OPENAI_PROMPT_COST_PER_MILLION_USD: z.coerce.number().finite().min(0).default(0),
  OPENAI_COMPLETION_COST_PER_MILLION_USD: z.coerce.number().finite().min(0).default(0),
  NOORG_PORT: integer('NOORG_PORT', 3000, 1),
  NOORG_STATE_PATH: z.string().trim().min(1).default('data/state.json'),
  NOORG_POLL_INTERVAL_MS: integer('NOORG_POLL_INTERVAL_MS', 100, 10),
  NOORG_MAX_CONCURRENT_TASKS: integer('NOORG_MAX_CONCURRENT_TASKS', 4, 1),
  NOORG_TASK_TIMEOUT_MS: integer('NOORG_TASK_TIMEOUT_MS', 60000, 100),
  NOORG_METRICS_ENABLED: z.preprocess(value => {
    if (value === undefined || value === '') return true;
    if (value === true || value === false) return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  }, z.boolean()),
});

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = rawSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid NoOrg configuration: ${details}`);
  }
  const provider = parsed.data.NOORG_LLM_PROVIDER;
  if (provider === 'openai' && !parsed.data.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required when NOORG_LLM_PROVIDER=openai');
  }
  const statePath = resolve(parsed.data.NOORG_STATE_PATH);
  const sourceRoot = resolve(process.cwd(), 'src');
  const docsRoot = resolve(process.cwd(), 'docs');
  const promptsRoot = resolve(process.cwd(), 'prompts');
  const isInside = (root: string): boolean => {
    const pathFromRoot = relative(root, statePath);
    return pathFromRoot === '' || (!pathFromRoot.startsWith('..') && !isAbsolute(pathFromRoot));
  };
  if (isInside(sourceRoot) || isInside(docsRoot) || isInside(promptsRoot)) {
    throw new Error('NOORG_STATE_PATH must point outside source, documentation, and prompt trees');
  }
  return {
    environment: parsed.data.NODE_ENV,
    provider,
    openai: {
      ...(parsed.data.OPENAI_API_KEY === undefined ? {} : { apiKey: parsed.data.OPENAI_API_KEY }),
      model: parsed.data.OPENAI_MODEL,
      ...(parsed.data.OPENAI_BASE_URL === undefined
        ? {}
        : { baseUrl: parsed.data.OPENAI_BASE_URL }),
      timeoutMs: parsed.data.OPENAI_TIMEOUT_MS,
      maxRetries: parsed.data.OPENAI_MAX_RETRIES,
      retryBaseMs: parsed.data.OPENAI_RETRY_BASE_MS,
      promptCostPerMillionUsd: parsed.data.OPENAI_PROMPT_COST_PER_MILLION_USD,
      completionCostPerMillionUsd: parsed.data.OPENAI_COMPLETION_COST_PER_MILLION_USD,
    },
    server: { port: parsed.data.NOORG_PORT },
    statePath,
    pollIntervalMs: parsed.data.NOORG_POLL_INTERVAL_MS,
    maxConcurrentTasks: parsed.data.NOORG_MAX_CONCURRENT_TASKS,
    defaultTaskTimeoutMs: parsed.data.NOORG_TASK_TIMEOUT_MS,
    metricsEnabled: parsed.data.NOORG_METRICS_ENABLED,
  };
}
