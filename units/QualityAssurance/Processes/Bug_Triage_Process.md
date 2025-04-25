# Bug Triage Process

## Overview

The Bug Triage Process defines how defects are reviewed, prioritized, and assigned for resolution. This systematic approach ensures that critical issues are addressed first and appropriate resources are allocated efficiently.

## Process Owner

- [[../Policies/PositionsPersonas|QA Lead]]

## Related Policies

- [[../Policies/Defect_Management_Policy|Defect Management Policy]]
- [[../Policies/Release_Criteria_Policy|Release Criteria Policy]]

## Prerequisites

- Documented defect in the defect tracking system
- Initial severity/priority assessment
- Reproducible steps or clear impact description

## Process Steps

### 1. Preparation

- QA team collects all new defects reported since the last triage
- QA prepares defect summary with reproduction steps, environment details, and initial severity assessment
- Meeting scheduled with key stakeholders (QA, Development, Product Management)

### 2. Triage Meeting

- Review each defect in the queue
- Verify defect validity and reproducibility
- Classify each defect:
  - **Priority**: P1 (Critical), P2 (High), P3 (Medium), P4 (Low)
  - **Severity**: S1 (Showstopper), S2 (Major), S3 (Minor), S4 (Cosmetic)
  - **Type**: Functional, Performance, Security, Usability, Documentation
- Assign defect ownership to appropriate development team/individual
- Set target resolution timeline based on priority

### 3. Escalation Criteria

- P1 (Critical) defects require immediate notification to:
  - Development Team Lead
  - Product Owner
  - If security-related: [[../../Security/index|Security Unit]]
  - If compliance-related: [[../../Compliance/index|Compliance Unit]]

### 4. Follow-up Actions

- Distribute triage meeting notes to relevant stakeholders
- Update defect tracking system with decisions and assignments
- Schedule follow-up reviews for unresolved P1/P2 defects

### 5. Metrics and Reporting

- Track key metrics:
  - Defect resolution time by priority
  - Defect aging (time from report to resolution)
  - Defects by component/module
- Generate [[../Reports/Defect_Analysis_Report_Template|Defect Analysis Report]] for sprint/release reviews

## Tools and Resources

- Defect tracking system
- Triage meeting template: [[Bug_Triage_Meeting_Template|Template]]
- Knowledge base for known issues

## Continuous Improvement

- Review triage process effectiveness quarterly
- Adjust classification criteria based on patterns observed
- Incorporate feedback from development and product teams

## References

- [[../../Development/Processes/Code_Review_Process|Development Code Review Process]]
- [[../../Operations/Processes/Incident_Management_Process|Operations Incident Management Process]]
- [[../MeetingNotes/README|QA Meeting Notes]] 