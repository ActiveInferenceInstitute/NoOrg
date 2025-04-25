# Research Unit State Structure

## Unit Information
- **ID**: research_unit
- **Type**: department

## State Tree
```
└── root
    ├── status
    │   ├── operational_status: active
    │   ├── current_projects: 3
    │   ├── resource_utilization: 0.95
    │   └── updated_at: 2025-04-24T22:15:28.518Z
    ├── projects
    │   └── active
    │       ├── 0
    │       │   ├── id: project_alpha
    │       │   ├── role: research_lead
    │       │   └── allocation: 0.5
    │       ├── 1
    │       │   ├── id: project_beta
    │       │   ├── role: contributor
    │       │   └── allocation: 0.3
    │       └── 2
    │           ├── id: project_gamma
    │           ├── role: advisor
    │           └── allocation: 0.1
    └── shared_data
        └── user_count: 100

```

## Raw State Data
```json
{
  "status": {
    "operational_status": "active",
    "current_projects": 3,
    "resource_utilization": 0.95,
    "updated_at": "2025-04-24T22:15:28.518Z"
  },
  "projects": {
    "active": [
      {
        "id": "project_alpha",
        "role": "research_lead",
        "allocation": 0.5
      },
      {
        "id": "project_beta",
        "role": "contributor",
        "allocation": 0.3
      },
      {
        "id": "project_gamma",
        "role": "advisor",
        "allocation": 0.1
      }
    ]
  },
  "shared_data": {
    "user_count": 100
  }
}
```
