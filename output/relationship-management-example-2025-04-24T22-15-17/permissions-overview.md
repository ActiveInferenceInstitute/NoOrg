# Relationship Permissions Overview

## Permission Levels
- **READ**: Basic read access to a resource
- **WRITE**: Ability to modify a resource
- **ADMIN**: Full control over a resource including permission management

## Configured Permissions

| Source Unit | Target Unit | Relationship Type | Resource | Permission Level | Expiration |
|-------------|------------|-------------------|----------|------------------|------------|
| Executive Committee | Research Division | hierarchy | project_alpha_data | read | 2025-10-21T22:15:17.103Z |
| AI Team | Platform Team | peer | research_data | write | 2025-07-23T22:15:17.103Z |
| Data Science Team | AI Team | peer | research_data | admin | 2025-07-23T22:15:17.103Z |

## Permission Inheritance

The permission model demonstrated here supports:
- Direct resource permissions
- Relationship-based access control
- Conditional permissions based on time and context

