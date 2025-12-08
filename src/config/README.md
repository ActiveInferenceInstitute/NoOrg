# Configuration Module

Runtime configuration helpers live here. Use these utilities to load, validate, and pass typed settings (e.g., coordinator defaults, API keys, storage paths) into the core systems.

- Ensure new configuration schemas document required/optional fields.
- Prefer environment variables for secrets; validate before use.
- Keep examples minimal and aligned with `docker-compose.yml` and `README.md`.

