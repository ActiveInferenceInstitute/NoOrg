# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within NoOrg, please send an email to the maintainers. All security vulnerabilities will be promptly addressed.

**Do NOT open a public GitHub issue for security vulnerabilities.**

## Security Best Practices

When working with agents in this framework:

1. **API Keys**: Never commit API keys. Use environment variables (see `.env.example`).
2. **Input Validation**: All agents validate inputs at method entry points.
3. **Circuit Breakers**: External service calls are wrapped with resilience patterns.
4. **Logging**: Use structured logging via the Logger class; never log sensitive data.

## Agent Security Model

Each agent operates within a defined scope:

- Agents cannot access resources outside their designated Unit.
- Cross-agent communication is mediated by the `MultiAgentCoordinator`.
- All external calls use timeout, retry, and circuit breaker patterns.

## Related Documentation

- [Security Unit](./units/Security/AGENTS.md)
- [Framework Security Docs](./docs/security/AGENTS.md)
