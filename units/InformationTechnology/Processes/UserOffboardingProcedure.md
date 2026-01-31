# User Offboarding Procedure

**Version:** 1.0  
**Effective Date:** [Date]  
**Last Reviewed:** [Date]

## 1. Purpose

To outline the standardized process for deprovisioning IT resources, retrieving assets, and securing data when an employee, contractor, or intern leaves the organization.

## 2. Scope

This procedure applies to all user termination, resignation, or transfer events requiring the removal of access and return of IT assets.

## 3. Prerequisites

*   Offboarding request or notification in ITSM from HR or manager.
*   List of user-owned assets and access rights.

## 4. Procedure Steps

1.  **Request Initiation:**  
    *   HR or manager initiates an Offboarding ticket in ITSM with user details and termination date.
2.  **Notification & Scheduling:**  
    *   Notify IT teams of upcoming offboarding and schedule deprovisioning tasks on the termination date/time.
3.  **Access Revocation:**  
    *   Disable or remove user accounts (AD, email, applications) at the termination time.
    *   Revoke VPN and remote access.
4.  **Asset Retrieval:**  
    *   Collect company-owned hardware and peripherals (laptop, mobile devices, access cards).
    *   Inspect and record asset condition and return in Asset Management.
5.  **Data Handling:**  
    *   Transfer or archive user data (home folder, shared drives, email) according to Data Security and Retention policies.
    *   Securely erase data from devices slated for reuse or disposal.
6.  **Notification of Completion:**  
    *   Confirm with HR and manager that offboarding tasks are complete.
    *   Close the Offboarding ticket in ITSM.

## 5. Roles and Responsibilities

*   **HR:** Initiates offboarding request and provides termination details.  
*   **Help Desk:** Disables user accounts, revokes access, collects assets.  
*   **Asset Management:** Tracks returned hardware and updates inventory.  
*   **Data Owner/IT:** Archives or transfers user data and ensures secure disposal.

## 6. Workflow Diagram

```mermaid
graph TD
    A[HR/Manager Submits Offboarding Request] --> B[Log Ticket in ITSM]
    B --> C{Schedule Deprovisioning Tasks}
    C --> D[Disable User Accounts & Access]
    D --> E[Collect & Record Hardware Assets]
    E --> F[Archive & Secure Data]
    F --> G[Notify HR/Manager of Completion]
    G --> H[Close Offboarding Ticket]
```text 