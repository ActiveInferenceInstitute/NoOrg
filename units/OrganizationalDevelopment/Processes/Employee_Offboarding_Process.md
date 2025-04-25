# Employee Offboarding Process

## 1. Purpose
To provide a consistent, respectful, and efficient process for managing employee departures, ensuring all administrative, logistical, and knowledge transfer tasks are completed while maintaining security and compliance.

## 2. Scope
- All voluntary and involuntary employee separations (resignations, retirements, terminations).
- Roles and responsibilities of the departing employee, Manager, HR, IT, Finance/Payroll, and Security.

## 3. Process Steps

```mermaid
graph TD
    subgraph Initiation
        A[Employee Resignation Received] --> B{Manager Notifies HR};
        C[Involuntary Termination Decision] --> B;
    end

    B --> D(HR: Acknowledge Resignation / Plan Termination Meeting);
    D --> E{HR/Manager: Confirm Last Day & Offboarding Plan};

    subgraph Execution Phase
        E --> F[Manager: Develop Knowledge Transfer Plan];
        E --> G[HR: Prepare Offboarding Paperwork & Checklist];
        E --> H[IT: Schedule Asset Return & Access Revocation];
        E --> I[Finance: Prepare Final Pay Calculation];

        F --> J[Employee/Manager: Execute Knowledge Transfer];
        G --> K[HR/Manager: Conduct Exit Interview (Voluntary)];
        H --> L[IT: Collect Assets / Revoke Access (Last Day)];
        I --> M[Finance: Process Final Paycheck];
        G --> N[HR: Finalize Benefits Info (COBRA, etc.)];
    end

    subgraph Finalization (Last Day / Post-Departure)
        J & K & L & M & N --> O{Employee Last Day};
        O --> P[Manager: Confirm Tasks Complete];
        O --> Q[HR: Update HRIS - Terminated Status];
        O --> R[Security: Ensure Physical Access Revoked];
        Q --> S[HR: File Offboarding Documentation];
    end
```

**Detailed Steps:**

1.  **Initiation:**
    *   **Voluntary:** Employee submits resignation to Manager. Manager acknowledges and immediately notifies HR.
    *   **Involuntary:** Termination decision made following relevant policies ([[Policy:Employee_Discipline]], [[Policy:Performance_Management]]). Manager consults with HR and Legal (if needed) before action.
2.  **Planning & Notification:**
    *   HR acknowledges resignation (if voluntary) or plans termination meeting (if involuntary).
    *   HR and Manager confirm the employee's last day of employment.
    *   HR initiates the offboarding checklist/workflow.
    *   HR notifies IT, Finance/Payroll, and Security of the upcoming departure date.
3.  **Knowledge Transfer & Task Completion:**
    *   Manager works with the departing employee to create and execute a knowledge transfer plan (documenting key responsibilities, projects, contacts).
    *   Manager ensures handover of ongoing tasks and projects.
4.  **Administrative & Logistics:**
    *   **HR:**
        *   Prepares offboarding paperwork (separation agreement if applicable, final forms).
        *   Schedules and conducts an Exit Interview (for voluntary separations) to gather feedback.
        *   Provides information on final pay, benefits continuation (e.g., COBRA), retirement funds, etc.
    *   **IT:**
        *   Schedules collection of company assets (laptop, phone, access cards) on the last day.
        *   Plans revocation of system access effective end of the last day.
    *   **Finance/Payroll:**
        *   Calculates final pay, including accrued vacation payout, deductions, etc., in accordance with state laws.
    *   **Employee:**
        *   Cooperates with knowledge transfer.
        *   Completes exit interview (if applicable).
        *   Returns all company property by the last day.
        *   Submits final expense reports.
5.  **Last Day & Post-Departure:**
    *   Manager confirms completion of knowledge transfer and collects any immediate items.
    *   IT collects all company assets and confirms system access is revoked.
    *   Security ensures physical access is disabled.
    *   HR processes final termination in [[Human_Resources_Information_System_HRIS]].
    *   Finance issues final paycheck according to legal requirements.
    *   HR files all offboarding documentation.

## 4. Roles and Responsibilities
-   **Departing Employee:** Provide adequate notice (voluntary), cooperate with knowledge transfer, return company property, complete exit interview (voluntary).
-   **Manager:** Notify HR immediately, facilitate knowledge transfer, approve final time/expenses, conduct final check-in, collect immediate assets.
-   **HR:** Manage overall process, conduct exit interviews, handle paperwork, notify relevant departments, ensure compliance, update HRIS.
-   **IT:** Reclaim assets, revoke system access, manage data backup/transfer if needed.
-   **Finance/Payroll:** Calculate and process final pay, manage final expense reports.
-   **Security:** Revoke physical access.

## 5. Key Tools & Resources
-   Offboarding Checklist
-   Knowledge Transfer Plan Template
-   Exit Interview Questionnaire
-   [[Human_Resources_Information_System_HRIS]]
-   Separation Agreement Template (if applicable)
-   IT Asset Management System
-   Benefits Continuation Information (e.g., COBRA packet)

## 6. Metrics & Evaluation
-   Completion rate of offboarding checklists.
-   Timeliness of final pay processing.
-   Return rate of company assets.
-   Analysis of Exit Interview data (themes, trends).
-   Feedback from managers on process efficiency.

## 7. Related Policies & Processes
-   [[Policy:Employee_Discipline]] (for involuntary termination)
-   [[Policy:Data_Privacy]] / [[Policy:Information_Security]] (Access revocation, data handling)
-   [[Policy:IT_Asset_Management]]
-   [[Policy:Payroll]]
-   [[Policy:Record_Retention]]
-   Benefits Plan Documents

## 8. Process Review
-   Reviewed annually by HR, involving IT, Finance, and Legal input.

---
**Metadata**
- Process ID: [PROC-OD-005]
- Version: 1.0
- Owner: [[Head of Human Resources]]
- Last Updated: <% tp.date.now("YYYY-MM-DD") %> 