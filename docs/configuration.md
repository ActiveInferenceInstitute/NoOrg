# Configuration

Configuration is loaded once by `src/config/config.ts`.

| Variable                                   | Default                                       | Meaning                                                             |
| ------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------- |
| `NODE_ENV`                                 | `development`                                 | `development`, `test`, or `production`                              |
| `NOORG_LLM_PROVIDER`                       | required                                      | Explicitly selects `local` or `openai`                              |
| `OPENAI_API_KEY`                           | empty                                         | Required for the OpenAI provider                                    |
| `OPENAI_MODEL`                             | `gpt-4o-mini`                                 | OpenAI model name                                                   |
| `OPENAI_TIMEOUT_MS`                        | `30000`                                       | Provider request timeout                                            |
| `OPENAI_MAX_RETRIES`                       | `2`                                           | Maximum retry count for retryable provider failures                 |
| `OPENAI_RETRY_BASE_MS`                     | `250`                                         | Exponential retry backoff base                                      |
| `OPENAI_PROMPT_COST_PER_MILLION_USD`       | `0`                                           | Configured prompt cost for usage accounting                         |
| `OPENAI_COMPLETION_COST_PER_MILLION_USD`   | `0`                                           | Configured completion cost for usage accounting                     |
| `NOORG_HOST`                               | `127.0.0.1` development, `0.0.0.0` production | HTTP bind host                                                      |
| `NOORG_PORT`                               | `3000`                                        | HTTP port                                                           |
| `NOORG_HTTP_AUTH_TOKEN`                    | empty                                         | Bearer token for task and metrics endpoints; required in production |
| `NOORG_HTTP_MAX_BODY_BYTES`                | `1048576`                                     | Maximum HTTP JSON request size                                      |
| `NOORG_STATE_PATH`                         | `data/state.json`                             | Versioned runtime state file                                        |
| `NOORG_POLL_INTERVAL_MS`                   | `100`                                         | Queue polling interval                                              |
| `NOORG_MAX_CONCURRENT_TASKS`               | `4`                                           | Process-wide task limit                                             |
| `NOORG_TASK_TIMEOUT_MS`                    | `60000`                                       | Default task timeout                                                |
| `NOORG_SHUTDOWN_TIMEOUT_MS`                | `10000`                                       | Maximum graceful shutdown drain time                                |
| `NOORG_MAX_TASK_INPUT_BYTES`               | `1048576`                                     | Maximum serialized task input size                                  |
| `NOORG_MAX_RESULT_BYTES`                   | `1048576`                                     | Maximum serialized task result size                                 |
| `NOORG_MAX_WORKFLOW_DEPTH`                 | `32`                                          | Maximum parent/dependency graph depth                               |
| `NOORG_MAX_WORKFLOW_CHILDREN`              | `100`                                         | Maximum children attached to one parent task                        |
| `NOORG_PROVIDER_BUDGET_USD`                | empty                                         | Optional cumulative provider cost budget                            |
| `NOORG_PROVIDER_MAX_REQUESTS_PER_MINUTE`   | `0`                                           | Provider request limit; zero disables the limit                     |
| `NOORG_PROVIDER_CIRCUIT_FAILURE_THRESHOLD` | `5`                                           | Consecutive transport failures before circuit opening               |
| `NOORG_PROVIDER_CIRCUIT_COOLDOWN_MS`       | `30000`                                       | Circuit cooldown before one probe is allowed                        |
| `NOORG_AGENT_MODULES`                      | empty                                         | Comma-separated paths to configured agent modules                   |
| `NOORG_AGENT_MODULE_TRUSTED_SHA256`        | empty                                         | `path=sha256` allowlist for modules outside the deployment boundary |
| `NOORG_METRICS_ENABLED`                    | `true`                                        | Enables `/metrics`                                                  |

The provider profile is always explicit. The OpenAI profile refuses to start without an API key. Invalid values fail during startup with the variable name and validation reason. State paths cannot point into source, documentation, or prompt trees.

The task API is exposed under `/v1/tasks`. `POST /v1/tasks` accepts idempotency keys, deadlines, retry backoff, parent IDs, dependency IDs, priority propagation, and parent completion policies. `GET /v1/tasks` supports `status`, `agentId`, `capability`, `idempotencyKey`, `limit`, and `offset` filters. Health and readiness remain unauthenticated for orchestration probes; task and metrics endpoints require `Authorization: Bearer <NOORG_HTTP_AUTH_TOKEN>` whenever a token is configured. Production configuration requires the token. Health and Prometheus metrics distinguish queued tasks blocked by missing capabilities from tasks waiting on agent capacity. Workflow depth and parent breadth are bounded by configuration. Agent modules inside the deployment boundary are loaded directly; modules outside it require a matching SHA-256 allowlist entry.
