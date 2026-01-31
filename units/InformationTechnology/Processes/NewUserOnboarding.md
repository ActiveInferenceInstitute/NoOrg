# New User Onboarding Procedure

**Version:** 1.0  
**Effective Date:** [Date]  
**Last Reviewed:** [Date]

## 1. Purpose

To outline the standardized process for provisioning and configuring IT resources (accounts, hardware, access) for new employees, contractors, and interns joining the organization.

## 2. Scope

This procedure applies to all new hires, transfers, contractors, and interns requiring organizational IT resources.

## 3. Pre-requisites

*   Approved new user request from HR or manager with details (name, role, department, start date).
*   Validated resource requirements (hardware, software, access levels).

## 4. Procedure Steps

1.  **Request Logging:**  
    *   HR or manager submits a New User Request ticket via the ITSM system.
2.  **Account Provisioning:**  
    *   Create Active Directory (AD) user account.
    *   Provision corporate email mailbox.
    *   Create or assign application-specific user accounts (e.g., CRM, ERP).
3.  **Hardware Provisioning:**  
    *   Order or assign hardware (laptop, desktop, accessories).
    *   Configure hardware with standard OS image, apply security baseline and antivirus software.
4.  **Access and Permissions:**  
    *   Assign role-based access to network shares, file systems, and applications.
    *   Enable VPN or remote access if required.
5.  **Software Installation:**  
    *   Install standard productivity tools (e.g., Office suite, web browsers).
    *   Install department-specific or specialized software as requested.
6.  **Documentation:**  
    *   Record asset tags, serial numbers, and assigned user in the IT Asset Management system.
    *   Document all created accounts and permissions in the ticket.
7.  **Orientation and Handover:**  
    *   Notify the hiring manager that provisioning is complete.
    *   Provide user with credentials, orientation guide, and contact information for support.
8.  **Post-Onboarding Review:**  
    *   After one week, verify that the user has all required access and that no outstanding tickets remain.

## 5. Roles and Responsibilities

*   **HR:** Initiates the new user request and provides user details.  
*   **Help Desk:** Creates accounts, orders hardware, initial configuration.  
*   **Systems Administrator:** Assigns permissions, network access, and application accounts.  
*   **Hiring Manager:** Reviews, approves provisioning, and confirms completion with the user.

## 6. Workflow Diagram

```mermaid
graph LR
  A[HR submits New User Request] --> B[Log Ticket in ITSM/HRIS]
  B --> C[Provision Accounts (AD, Email)]
  C --> D[Order & Configure Hardware]
  D --> E[Install Software & Configure Settings]
  E --> F[Assign Permissions & Access]
  F --> G[Document Assets & Accounts]
  G --> H[Notify Manager & Handover to User]
  H --> I[Onboarding Complete]
```text

## 7. Procedure Review

This procedure will be reviewed annually and updated as necessary. 