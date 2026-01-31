# Change Management Procedure

**Version:** 1.0  
**Effective Date:** [Date]  
**Last Reviewed:** [Date]

## 1. Purpose

To define the detailed steps and workflow for requesting, approving, implementing, and reviewing changes to the IT environment, minimizing risk and service disruption.

## 2. Scope

This procedure applies to all Normal and Emergency changes in the production IT environment managed by the IT Department.

## 3. Procedure Steps

1.  **Change Request Submission:**  
    *   User or IT staff submits a Change Request (CR) via the ITSM portal, providing details: description, rationale, scope, risk assessment, rollback plan, scheduling preferences.
2.  **Initial Review & Categorization:**  
    *   Change Manager performs initial review to categorize change type (Standard, Normal, Emergency) and verifies completeness of CR.
3.  **Risk & Impact Assessment:**  
    *   Technical teams and stakeholders assess potential impact, dependencies, and resource requirements.  
4.  **Approval Workflow:**  
    *   **Standard Changes:** Automatically approved if pre-authorized; documented in the system.  
    *   **Normal Changes:** Presented to the Change Advisory Board (CAB) during scheduled meeting for approval.  
    *   **Emergency Changes:** Reviewed and approved by the Emergency Change Authority (e.g., change manager or delegate) immediately via expedited process.  
5.  **Scheduling & Communication:**  
    *   Approved changes are scheduled in maintenance windows.  
    *   Notifications sent to impacted users and stakeholders outlining time, expected downtime, and contingency measures.  
6.  **Implementation:**  
    *   Change Implementer executes the change according to the approved plan and rollback procedure.  
    *   Progress and issues are logged in the CR ticket.  
7.  **Validation & Testing:**  
    *   Post-implementation testing ensures the change achieves desired outcomes without adverse effects.  
8.  **Closure & Documentation:**  
    *   Change Manager reviews results, marks CR as completed, and updates documentation.  
    *   Completed changes are recorded in the Change Log.  
9.  **Post-Implementation Review (PIR):**  
    *   For Normal and Emergency changes, a PIR is conducted to capture lessons learned and update procedures.

## 4. Workflow Diagram

```mermaid
graph TD
    A[Submit Change Request] --> B{Initial Review & Categorization}
    B --> C[Risk & Impact Assessment]
    C --> D{Change Type}
    D -- Standard --> E[Automatic Approval]
    D -- Normal --> F[CAB Review & Approval]
    D -- Emergency --> G[Emergency Approval]
    E --> H[Schedule & Notify]
    F --> H
    G --> H
    H --> I[Implement Change]
    I --> J[Test & Validate]
    J --> K{Success?}
    K -- Yes --> L[Close CR & Document]
    K -- No --> M[Rollback Using Rollback Plan]
    M --> N[Analyze Failure & Update CR]
    L --> O[Post-Implementation Review]
```text 