# Change Management Policy

**Version:** 1.0
**Effective Date:** [Date]
**Last Reviewed:** [Date]

## 1. Purpose

To establish a standardized process for managing changes to the IT environment (infrastructure, applications, systems, services) in order to minimize risk, reduce service disruption, and ensure efficient use of resources.

## 2. Scope

This policy applies to all changes to the production IT environment managed by the IT Department, including but not limited to:
*   Hardware installations, upgrades, or replacements (servers, network devices, etc.)
*   Software installations, updates, or patches (operating systems, applications)
*   System configuration changes
*   Network modifications
*   Database schema changes
*   Security setting adjustments
*   Changes to third-party services impacting the organization

Exclusions: [Specify any exclusions, e.g., standard service requests handled outside change management, non-production environments under certain conditions]

## 3. Policy Statements

*   **Standardized Process:** All applicable changes must follow the defined Change Management process.
*   **Change Request (CR):** All changes must be initiated via a formal Change Request submitted through the designated system (e.g., ITSM tool).
*   **Risk and Impact Assessment:** Each CR must include an assessment of potential risks, impact on services and users, and necessary resources.
*   **Approval:** Changes must be reviewed and approved by authorized personnel or a Change Advisory Board (CAB) based on the change type, risk, and impact.
*   **Scheduling:** Approved changes must be scheduled to minimize disruption, typically during established maintenance windows. Communication regarding scheduled changes must be provided to affected stakeholders.
*   **Testing:** Changes should be tested in a non-production environment where feasible before deployment to production.
*   **Rollback Plan:** A documented plan for backing out the change must be included in the CR in case of failure.
*   **Documentation:** All changes must be documented, including the CR details, approval, implementation steps, testing results, and outcome.
*   **Emergency Changes:** A separate, expedited process exists for emergency changes required to restore service or address critical security vulnerabilities. These changes still require documentation and post-implementation review.
*   **Communication:** Clear communication channels must be used to inform stakeholders about planned, in-progress, and completed changes.

## 4. Change Types and Approval Authorities

*   **Standard Changes:** Low-risk, pre-approved, routine changes with a well-defined procedure (e.g., standard user account creation). [May require minimal approval or logging].
*   **Normal Changes:** Changes that are not standard or emergency. Require risk/impact assessment and formal approval (e.g., by manager, CAB).
*   **Emergency Changes:** Changes needed immediately to resolve an incident or critical security issue. Require expedited approval (e.g., by designated emergency change authority) and post-implementation review.

## 5. Change Advisory Board (CAB)

*   A CAB, composed of representatives from IT and potentially affected business units, will review and approve/reject Normal Changes with significant risk or impact.
*   The CAB will meet regularly [Specify frequency, e.g., weekly].

## 6. Roles and Responsibilities

*   **Change Requester:** Initiates the CR and provides necessary details.
*   **Change Implementer:** Executes the approved change plan.
*   **Change Manager:** Facilitates the change management process, manages the CR workflow, chairs the CAB.
*   **Change Approver(s)/CAB:** Reviews and approves/rejects CRs based on risk, impact, and readiness.
*   **Tester:** Validates the change before and/or after implementation.

## 7. Process Flow

Refer to the [Change Management Procedure document](AGENTS.md) for the detailed workflow, including CR submission, assessment, approval, implementation, and review steps.

## 8. Enforcement

*   Compliance with this policy and the associated process is mandatory.
*   Unauthorized changes are prohibited and may result in disciplinary action.

## 9. Policy Review

*   This policy will be reviewed annually and updated as necessary. 