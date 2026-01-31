# Access Request Procedure

**Version:** 1.0  
**Effective Date:** [Date]  
**Last Reviewed:** [Date]

## 1. Purpose

To outline the standard process for requesting, approving, granting, modifying, and revoking user access to IT systems, applications, and data resources.

## 2. Scope

This procedure applies to all requests for access to organizational IT resources governed by access controls.

## 3. Prerequisites

*   User identity verified.
*   Role-Based Access Control (RBAC) matrix defined for standard roles.
*   Data owner or system owner identified for approval.

## 4. Procedure Steps

1.  **Request Submission:**  
    *   User or manager submits an Access Request via the ITSM portal, specifying the resource, required access level, and business justification.
2.  **Initial Validation:**  
    *   Help Desk or relevant team validates the request for completeness and user identity.
3.  **Approval Workflow:**  
    *   **Manager Approval:** Request is routed to the user's manager for initial approval.
    *   **Resource Owner Approval:** If manager approves, request is routed to the data/system owner for final approval.
4.  **Provisioning:**  
    *   Upon final approval, the responsible IT team (e.g., Sys Admin, Application Admin) grants the requested access.
5.  **Notification:**  
    *   User and requester are notified once access is granted.
6.  **Documentation:**  
    *   Access grant is logged in the ITSM ticket and relevant system audit logs.
7.  **Access Modification/Revocation:**  
    *   Similar process followed for modifying or revoking access (e.g., initiated by manager upon role change or termination via Offboarding Procedure).
8.  **Periodic Review:**  
    *   User access rights are periodically reviewed (e.g., quarterly, annually) by managers and resource owners to ensure continued necessity (User Access Review process).

## 5. Roles and Responsibilities

*   **User/Manager:** Initiates access request with justification.
*   **Help Desk/IT Team:** Validates request, routes for approval, provisions access.
*   **Manager:** Provides initial approval based on role requirements.
*   **Resource Owner:** Provides final approval based on data/system sensitivity and policy.
*   **IT Access Administrators:** Grant/modify/revoke access in specific systems.

## 6. Workflow Diagram

```mermaid
graph TD
    A[Submit Access Request] --> B[Initial Validation]
    B --> C{Manager Approval?}
    C -- Yes --> D{Resource Owner Approval?}
    C -- No --> E[Reject & Notify Requester]
    D -- No --> E
    D -- Yes --> F[Provision Access]
    F --> G[Notify User/Requester]
    G --> H[Log & Close Ticket]
```text

## 7. Procedure Review

This procedure will be reviewed annually and updated as necessary. 