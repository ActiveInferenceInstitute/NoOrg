# Development Unit State Structure

## Unit Information
- **ID**: development_unit
- **Type**: department

## State Tree
```
└── root
    ├── status
    │   ├── operational_status: active
    │   ├── current_sprints: 2
    │   ├── resource_utilization: 0.92
    │   └── updated_at: 2025-04-24T22:15:26.503Z
    ├── projects
    │   └── active
    │       ├── 0
    │       │   ├── id: project_alpha
    │       │   ├── role: implementation
    │       │   └── allocation: 0.5
    │       └── 1
    │           ├── id: project_delta
    │           ├── role: lead
    │           └── allocation: 0.4
    └── shared_data
        └── user_count: 120

```

## Raw State Data
```json
{
  "status": {
    "operational_status": "active",
    "current_sprints": 2,
    "resource_utilization": 0.92,
    "updated_at": "2025-04-24T22:15:26.503Z"
  },
  "projects": {
    "active": [
      {
        "id": "project_alpha",
        "role": "implementation",
        "allocation": 0.5
      },
      {
        "id": "project_delta",
        "role": "lead",
        "allocation": 0.4
      }
    ]
  },
  "shared_data": {
    "user_count": 120
  }
}
```
