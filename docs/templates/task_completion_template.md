# Task & Project Completion Template

## 📊 Task Status Dashboard
```mermaid
graph TB
    subgraph Current_Status
    S1[Tasks Completed<br>75%]
    S2[In Progress<br>20%]
    S3[Blocked<br>5%]
    end
    
    subgraph Priority
    P1[Critical<br>2]
    P2[High<br>5]
    P3[Medium<br>8]
    P4[Low<br>3]
    end
    
    subgraph Timeline
    T1[On Schedule<br>80%]
    T2[At Risk<br>15%]
    T3[Delayed<br>5%]
    end
```

## 📈 Completion Progress
```mermaid
xychart-beta
    title "Task Completion Trend"
    x-axis [Week 1, Week 2, Week 3, Week 4]
    y-axis "Completed Tasks" 0 --> 50
    y-axis "Completion Rate %" 0 --> 100
    line [10, 22, 35, 45]
    line [50, 65, 80, 90]
```

## 🎯 Task Dependencies
```mermaid
graph LR
    subgraph Critical_Path
    C1[Task 1] --> C2[Task 2] --> C3[Task 3]
    end
    
    subgraph Parallel_Tasks
    P1[Task A]
    P2[Task B]
    P3[Task C]
    end
    
    subgraph Blocked
    B1[Blocked 1]
    B2[Blocked 2]
    end
    
    C2 --> P1 & P2 & P3
    B1 -.-> C3
    B2 -.-> P3
```

## 📋 Task Breakdown Structure
```mermaid
mindmap
    root((Project<br>Tasks))
        Planning
            Requirements
            Design
            Resources
        Development
            Phase 1
            Phase 2
            Phase 3
        Testing
            Unit Tests
            Integration
            UAT
        Deployment
            Staging
            Production
            Verification
```

## ⏱️ Task Timeline
```mermaid
gantt
    title Task Schedule
    dateFormat YYYY-MM-DD
    
    section Critical Tasks
    Task 1    :crit, t1, 2024-01-01, 5d
    Task 2    :crit, t2, after t1, 3d
    
    section Main Tasks
    Task 3    :t3, after t2, 7d
    Task 4    :t4, after t3, 4d
    
    section Support Tasks
    Task 5    :t5, 2024-01-03, 8d
    Task 6    :t6, after t5, 5d
```

## 🔄 Task Flow
```mermaid
stateDiagram-v2
    [*] --> ToDo
    ToDo --> InProgress
    InProgress --> Review
    Review --> Done: Approved
    Review --> InProgress: Changes Needed
    InProgress --> Blocked: Blocker Found
    Blocked --> InProgress: Blocker Resolved
    Done --> [*]
```

## 📊 Resource Allocation
```mermaid
pie title "Task Distribution by Resource"
    "Team Member 1" : 35
    "Team Member 2" : 25
    "Team Member 3" : 20
    "Team Member 4" : 20
```

## 🎯 Task Priority Matrix
```mermaid
quadrantChart
    title Task Priority Matrix
    x-axis Low Impact --> High Impact
    y-axis Low Urgency --> High Urgency
    quadrant-1 Do First
    quadrant-2 Schedule
    quadrant-3 Delegate
    quadrant-4 Do Later
    Task1: [0.8, 0.9]
    Task2: [0.3, 0.4]
    Task3: [0.6, 0.7]
```

## 📈 Velocity Tracking
```mermaid
xychart-beta
    title "Team Velocity"
    x-axis [Sprint 1, Sprint 2, Sprint 3, Sprint 4]
    y-axis "Story Points" 0 --> 100
    y-axis "Completion %" 0 --> 100
    line [20, 25, 30, 35]
    line [85, 90, 88, 92]
```

## 🔍 Quality Gates
```mermaid
graph LR
    subgraph Requirements
    R1[Requirements<br>Review]
    R2[Scope<br>Verification]
    end
    
    subgraph Development
    D1[Code<br>Review]
    D2[Unit<br>Tests]
    end
    
    subgraph Testing
    T1[QA<br>Testing]
    T2[UAT]
    end
    
    Requirements --> Development
    Development --> Testing
```

## Task Documentation

### 📋 Task Details
- Task ID: [ID]
- Title: [Task Title]
- Description: [[tasks/description|Detailed Description]]
- Priority: [High/Medium/Low]
- Status: [To Do/In Progress/Review/Done]
- Due Date: [Date]
- Assigned To: [[people/assignee|Assignee]]

### 📊 Task Requirements
- Business Requirements: [[requirements/business|Business Specs]]
- Technical Requirements: [[requirements/technical|Tech Specs]]
- Acceptance Criteria: [[requirements/acceptance|Acceptance Criteria]]
- Dependencies: [[requirements/dependencies|Dependencies List]]

### 🛠️ Implementation Details
- Technical Design: [[implementation/design|Design Doc]]
- Architecture: [[implementation/architecture|Architecture]]
- Code Changes: [[implementation/code|Code Changes]]
- Test Cases: [[implementation/tests|Test Suite]]

### 🔍 Quality Assurance
- Test Plan: [[qa/test_plan|Test Plan]]
- Test Results: [[qa/results|Test Results]]
- Code Review: [[qa/code_review|Review Notes]]
- Performance Tests: [[qa/performance|Performance Results]]

### 📝 Documentation
- User Guide: [[docs/user_guide|User Documentation]]
- Technical Doc: [[docs/technical|Technical Documentation]]
- Release Notes: [[docs/release|Release Notes]]
- Known Issues: [[docs/issues|Issues List]]

### ✅ Completion Checklist
- Requirements Review: [[checklist/requirements|Requirements Sign-off]]
- Code Review: [[checklist/code|Code Review Sign-off]]
- Testing: [[checklist/testing|Testing Sign-off]]
- Documentation: [[checklist/docs|Documentation Sign-off]]
- Deployment: [[checklist/deployment|Deployment Sign-off]]

## Task Tracking

### 📈 Progress Updates
```mermaid
timeline
    title Task Progress Timeline
    section Planning
        Requirements : Complete
        Design : Complete
    section Development
        Coding : In Progress
        Testing : Pending
    section Review
        QA : Not Started
        UAT : Not Started
```

### 🚧 Blockers & Issues
```mermaid
mindmap
    root((Issues))
        Active
            Blocker 1
            Blocker 2
        Resolved
            Issue 1
            Issue 2
        Pending
            Risk 1
            Risk 2
```

### 📊 Metrics Dashboard
```mermaid
graph TB
    subgraph Completion
    C1[Progress: 75%]
    C2[Quality: 90%]
    C3[Time: 80%]
    end
    
    subgraph Issues
    I1[Open: 3]
    I2[Resolved: 12]
    I3[Pending: 2]
    end
    
    subgraph Reviews
    R1[Completed: 8]
    R2[Pending: 2]
    R3[Failed: 1]
    end
```

---
**Metadata**
- Template Version: 1.0
- Last Updated: [Date]
- Created By: [[people/creator|Creator]]
- Department: [[departments/dept|Department]]

**Related Templates**
- [[templates/project|Project Template]]
- [[templates/review|Review Template]]
- [[templates/testing|Testing Template]] 