# Configuration

Configuration is loaded once by `src/config/config.ts`.

| Variable | Default | Meaning |
| --- | --- | --- |
| `NODE_ENV` | `development` | `development`, `test`, or `production` |
| `NOORG_LLM_PROVIDER` | required | Explicitly selects `local` or `openai` |
| `OPENAI_API_KEY` | empty | Required for the OpenAI provider |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model name |
| `OPENAI_TIMEOUT_MS` | `30000` | Provider request timeout |
| `OPENAI_MAX_RETRIES` | `2` | Maximum retry count for retryable provider failures |
| `OPENAI_RETRY_BASE_MS` | `250` | Exponential retry backoff base |
| `OPENAI_PROMPT_COST_PER_MILLION_USD` | `0` | Configured prompt cost for usage accounting |
| `OPENAI_COMPLETION_COST_PER_MILLION_USD` | `0` | Configured completion cost for usage accounting |
| `NOORG_PORT` | `3000` | HTTP port |
| `NOORG_STATE_PATH` | `data/state.json` | Versioned runtime state file |
| `NOORG_POLL_INTERVAL_MS` | `100` | Queue polling interval |
| `NOORG_MAX_CONCURRENT_TASKS` | `4` | Process-wide task limit |
| `NOORG_TASK_TIMEOUT_MS` | `60000` | Default task timeout |
| `NOORG_METRICS_ENABLED` | `true` | Enables `/metrics` |

The provider profile is always explicit. The OpenAI profile refuses to start without an API key. Invalid values fail during startup with the variable name and validation reason. State paths cannot point into source, documentation, or prompt trees.
