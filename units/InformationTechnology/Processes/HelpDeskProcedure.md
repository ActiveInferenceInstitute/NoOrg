# Help Desk Procedure

**Version:** 1.0
**Effective Date:** [Date]
**Last Reviewed:** [Date]

## 1. Purpose

To outline the standard process for receiving, logging, prioritizing, assigning, resolving, and closing user support requests and incident reports via the IT Help Desk.

## 2. Scope

This procedure applies to all IT support requests and incident reports initiated by end-users within the organization.

## 3. Channels for Submitting Requests

Users can contact the Help Desk through the following approved channels:

*   **IT Service Management (ITSM) Portal:** [Link to Portal] (Preferred)
*   **Email:** [Help Desk Email Address]
*   **Phone:** [Help Desk Phone Number]
*   **Walk-in:** [Location, if applicable]

## 4. Procedure Steps

1.  **Request Receipt & Logging:**
    *   Help Desk staff receive requests via approved channels.
    *   All requests are logged as tickets in the ITSM system.
    *   Essential information is captured: User details, contact info, description of issue/request, date/time, channel of submission.
2.  **Initial Assessment & Prioritization:**
    *   Help Desk staff perform an initial assessment to understand the issue.
    *   The ticket is categorized (e.g., Incident, Service Request, Information Request).
    *   Priority is assigned based on impact (number of users affected, criticality of service) and urgency (business need). (Refer to [Prioritization Matrix] if available).
3.  **Assignment:**
    *   If resolvable by Tier 1 (Help Desk), the ticket remains with the logging staff member or available Tier 1 personnel.
    *   If requiring specialized knowledge or permissions, the ticket is assigned to the appropriate Tier 2/Tier 3 support team (e.g., Network, Server, Applications, Security) via the ITSM system.
4.  **Investigation & Diagnosis:**
    *   Assigned technician investigates the issue, potentially contacting the user for more information or remote assistance.
5.  **Resolution & Recovery:**
    *   Technician implements a solution or workaround.
    *   For Service Requests, the requested service/item is fulfilled.
    *   Resolution steps are documented in the ticket.
6.  **User Confirmation & Closure:**
    *   The user is notified of the resolution.
    *   Help Desk confirms with the user that the issue is resolved or the request is fulfilled.
    *   Once confirmed, the ticket is closed in the ITSM system.
    *   Tickets may be automatically closed after a set period following resolution notification if no user response is received.
7.  **Escalation (if necessary):**
    *   If resolution takes longer than defined SLAs (Service Level Agreements) or requires higher authority, the ticket is escalated functionally (to senior technicians/specialists) or hierarchically (to management).

## 5. Workflow Diagram (Mermaid)

```mermaid
graph TD
    A[User Submits Request/Reports Incident] --> B{Log Ticket in ITSM};
    B --> C{Assess & Prioritize};
    C --> D{Attempt Tier 1 Resolution};
    D -- Resolved --> G[Confirm Resolution with User];
    D -- Needs Escalation --> E{Assign to Tier 2/3 Team};
    E --> F[Investigate & Resolve];
    F --> G;
    G --> H{Close Ticket};

    %% Escalation Path
    F -- Resolution Delayed/Complex --> I{Escalate?};
    I -- Yes --> J[Escalate (Functional/Hierarchical)];
    J --> F;
    I -- No --> F;

    C -- Information Request --> G; %% Simple requests might skip Tier 1 attempt
```

## 6. Service Level Agreements (SLAs)

*   Response and resolution time targets are defined based on priority levels. [Link to SLA document or details].

## 7. Roles and Responsibilities

*   **End User:** Submits requests clearly, provides necessary information, confirms resolution.
*   **Help Desk Staff (Tier 1):** Logs tickets, performs initial assessment, resolves basic issues, escalates when necessary, confirms resolution, closes tickets.
*   **Specialized Support Teams (Tier 2/3):** Investigate and resolve escalated/complex tickets within their domain.
*   **IT Management:** Oversees the Help Desk function, handles hierarchical escalations.

## 8. Procedure Review

*   This procedure will be reviewed annually and updated as needed. 