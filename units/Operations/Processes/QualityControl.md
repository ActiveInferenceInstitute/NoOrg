# Quality Control Process

## Process Overview
**Type**: Core
**Owner**: [[Quality Assurance Lead]]
**Version**: 0.1
**Status**: Draft

## Purpose and Scope
### Purpose
To ensure that operational processes, outputs, and services consistently meet or exceed defined quality standards and comply with relevant regulations.

### Scope
- **In Scope**: Defining quality metrics, implementing monitoring checks, performing audits, identifying non-conformances, managing corrective actions for all operational activities.
- **Out of Scope**: Setting corporate-level quality policy (handled by corporate QA).

## Process Details
### Prerequisites
1. Defined Quality Standards (from corporate QA and operational needs).
2. Access to process execution data and outputs.
3. Trained QA personnel.

### Inputs
1. Quality Standards Documentation
   - Source: Corporate QA, Operations Unit
   - Format: Policy documents, SOPs, Specifications
   - Validation: Approved and published

2. Process Outputs / Service Delivery Records
   - Source: Operational Systems, Manual Checks
   - Format: System logs, inspection forms, service records
   - Validation: Sample checks, data integrity

### Process Steps
```mermaid
flowchart TD
    A(Start: Define/Review Quality Metrics) --> B(Plan QC Activities - Audits, Checks)
    B --> C(Execute QC Activities)
    C --> D{Record Findings}
    D --> E{Non-Conformance?}
    E -- Yes --> F(Initiate Corrective Action Process)
    F --> G(Track Corrective Action)
    G --> H{Resolved?}
    H -- Yes --> I(Verify Effectiveness)
    H -- No --> G
    I --> J(Report Quality Performance)
    E -- No --> J
    J --> K(End/Continuous Cycle)
```text

1. Step 1: Plan Quality Control Activities
   - Action: Schedule audits, define sampling plans, prepare checklists based on standards.
   - Actor: QA Lead
   - Tools: Audit Plan, QMS
   - Output: QC Schedule & Plan

2. Step 2: Execute QC Activities
   - Action: Conduct audits, perform inspections, review process data, monitor service delivery.
   - Actor: QA Lead, QA Staff, Operational Staff (self-checks)
   - Tools: Checklists, Monitoring tools, QMS
   - Output: QC Findings Report / Audit Report

3. Step 3: Manage Non-Conformance & Corrective Actions
   - Action: Document non-conformances, perform root cause analysis (RCA), define, implement, and track corrective/preventive actions (CAPA).
   - Actor: QA Lead, Process Owner, Operations Manager
   - Tools: CAPA forms, RCA tools (5 Whys, Fishbone), QMS, Project Tracker
   - Output: CAPA Record, Updated SOPs/Training

### Outputs
1. Quality Performance Reports
   - Type: Document/Dashboard
   - Format: Standard template, dashboard view
   - Destination: Operations Director, Corporate QA, Management
   - Usage: Performance review, compliance reporting

2. Corrective Action Records (CAPA)
   - Type: Record
   - Format: QMS record, database entry
   - Destination: QMS, Audit Logs
   - Usage: Audit trail, process improvement input

## Roles and Responsibilities
- [[Quality Assurance Lead]]: Oversees the QC process, manages audits, leads CAPA.
- [[Operations Manager]]: Ensures process owners implement corrective actions.
- [[Process Engineer]]: Assists with RCA and process changes resulting from CAPA.
- Operational Staff: Perform defined self-checks, participate in audits.

## Controls and Metrics
### Process Controls
- Audit Schedule Adherence
- CAPA Timeliness Tracking
- QC Checklist Usage

### Performance Metrics
- Defect Rate / Non-Conformance Rate (%)
- First Pass Yield (%)
- CAPA Closure Rate (%)
- Audit Finding Recurrence Rate (%)
- Compliance Score (%)

## Systems and Tools
- [[Quality Management System (QMS)]]
- [[Analytics Platform]] (for metric tracking)
- [[Audit Management Software]] (optional)
- [[Collaboration Platform]] (for communication)

## Exceptions and Error Handling
- Failure to detect non-conformance.
- Ineffective corrective actions.
- Delays in CAPA implementation.

## Related Processes
- [[ProcessManagement]]
- [[../Reports/Template_Operations_Monthly_Report|Monthly Performance Reporting]]
- Corporate Audit Process

## Documentation and Training
- QC Procedures & Checklists
- Auditor Training Program
- RCA Techniques Training
- QMS User Guides

## Compliance and Audit
- Adherence to ISO 9001, industry-specific regulations.
- Internal and external audit readiness.
- Full traceability of QC activities and findings.

## Change Management
- Changes to QC procedures follow a documented change control process within the QMS.

---
**Metadata**
- Created: <% tp.date.now("YYYY-MM-DD") %>
- Last Updated: <% tp.date.now("YYYY-MM-DD") %>
- Owner: [[Quality Assurance Lead]]
- Contributors: [[Operations Manager]], [[Process Engineer]]
- Review Status: Draft
- Security Classification: Internal 