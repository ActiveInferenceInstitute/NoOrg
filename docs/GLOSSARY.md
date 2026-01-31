# NoOrg Glossary

## Core Terminology

### Agent

An autonomous software entity capable of performing tasks, making decisions, and interacting with other agents or users. In NoOrg, agents correspond to specific domains (e.g., `LegalAgent`).

### Unit

A structural division of the organization representing a functional area (e.g., `Finance`, `Research`). Units contain policies, processes, and governance documentation but do not execute code directly.

### Policy

A distinct markdown document defining rules, guidelines, or constraints. Policies reside in the `Policies/` subdirectory of a Unit.

### Process

A documented workflow or procedure. Processes reside in the `Processes/` subdirectory of a Unit.

## Technical Terms

- **Context-Aware**: The ability of an agent to access and utilize the specific documentation of the Unit it is operating within.
- **Dual-Link Coverage**: The standard requiring both `AGENTS.md` (Technical) and `README.md` (General) in every directory.
- **Semantic Upgrade**: The process of enriching generic documentation with domain-specific descriptions and metadata.

## Directory Roles

- `src/`: Contains executable source code (TypeScript).
- `units/`: Contains organizational knowledge and structure (Markdown).
- `docs/`: Contains cross-cutting frameworks and guides.
- `agents/`: (Legacy) Previous agent definitions, superseded by `src/agents`.
