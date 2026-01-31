# Knowledge Review and Validation Process

## 1. Purpose

This document outlines the standard process for reviewing and validating organizational knowledge assets. The purpose is to ensure the accuracy, completeness, relevance, and appropriate classification of knowledge before it is formally published or shared widely, and periodically throughout its lifecycle, upholding the quality standards defined in the [Knowledge Creation Policy](../Policies/KnowledgeCreationPolicy.md).

## 2. Scope

This process applies to:
- Newly captured or created knowledge assets designated as requiring review (e.g., critical procedures, best practices, high-impact research findings).
- Existing knowledge assets undergoing periodic review as dictated by the [Knowledge Retention Policy](../Policies/KnowledgeRetentionPolicy.md) or triggered by specific events (e.g., process changes, user feedback).

## 3. Process Overview

The process involves assigning reviewers, conducting the review against defined criteria, providing feedback, making necessary revisions, obtaining approval, and updating the asset's status.

## 4. Workflow Diagram

```mermaid
graph TD
    A[Review Triggered] --> B{Assign Reviewer(s)};
    B --> C[Reviewer(s) Notified];
    C --> D[Conduct Review];
    D --> E{Review Criteria Met?};
    E -- Yes --> F[Approve Knowledge Asset];
    E -- No --> G[Provide Feedback/Revision Requests];
    G --> H[Revise Knowledge Asset];
    H --> D; 
    F --> I[Update Asset Status/Metadata];
    I --> J[End Review Cycle];

    subgraph Review Criteria
        direction LR
        Acc[Accuracy]
        Comp[Completeness]
        Rel[Relevance]
        Clar[Clarity]
        Class[Classification]
        Compl[Compliance]
    end
    D -- Checks --> Review Criteria;

    subgraph Triggers
        direction TB
        T1[New Asset Creation]
        T2[Periodic Review Date]
        T3[Significant Change Event]
        T4[User Feedback]
    end
    Triggers --> A;

    subgraph Legend
        direction TB
        Start(((Start))) -.-> A
        Endd(((End))) -.-> J
        Process[Process Step]
        Decision{Decision}
    end

    style Start fill:#fff,stroke:#333,stroke-width:2px
    style Endd fill:#fff,stroke:#333,stroke-width:2px
```text

## 5. Process Steps

1.  **Review Triggered:**
    *   **Trigger:** Submission of a new asset marked for review during the [Knowledge Capture Process](KnowledgeCaptureProcess.md); asset reaching its scheduled review date ([Knowledge Retention Policy](../Policies/KnowledgeRetentionPolicy.md)); significant external event impacting the knowledge (e.g., policy change, system update); user feedback indicating potential issues.
    *   **Action:** The need for a review is identified.
    *   **Responsibility:** Knowledge Owner, KM System (automated trigger), KM Unit.

2.  **Assign Reviewer(s):**
    *   **Action:** Identify and assign appropriate Subject Matter Expert(s) (SMEs), peers, or managers to conduct the review based on the asset's content and criticality.
    *   **Responsibility:** Knowledge Owner, Manager, KM Unit (guidance).

3.  **Notify Reviewer(s):**
    *   **Action:** Formally notify the assigned reviewer(s) via email or KM system notification, providing a link to the asset and the review deadline.
    *   **Responsibility:** Knowledge Owner or KM System.

4.  **Conduct Review:**
    *   **Action:** Reviewer(s) assess the knowledge asset against predefined criteria:
        *   **Accuracy:** Is the information factually correct and up-to-date?
        *   **Completeness:** Is the information sufficiently detailed? Is necessary context provided?
        *   **Relevance:** Is the knowledge still relevant to current processes, systems, or goals?
        *   **Clarity:** Is the information presented clearly and understandably for the target audience?
        *   **Classification:** Is the assigned data classification appropriate according to the [Data Classification Policy](../Policies/DataClassificationPolicy.md)?
        *   **Compliance:** Does the asset comply with relevant organizational policies, standards, and regulations?
    *   **Responsibility:** Assigned Reviewer(s).

5.  **Evaluate Review Outcome:**
    *   **Action:** Based on the review, determine if the asset meets all criteria.
    *   **Responsibility:** Assigned Reviewer(s).

6.  **Provide Feedback/Revision Requests (If Criteria Not Met):**
    *   **Action:** If revisions are needed, the reviewer(s) provide specific, constructive feedback to the knowledge owner, detailing the required changes.
    *   **Responsibility:** Assigned Reviewer(s).

7.  **Revise Knowledge Asset:**
    *   **Action:** The knowledge owner makes the necessary revisions based on the feedback.
    *   **Responsibility:** Knowledge Owner.
    *   **Next Step:** Return to Step 4 (Conduct Review) for the reviewer to check the revisions.

8.  **Approve Knowledge Asset (If Criteria Met):**
    *   **Action:** If the asset meets all criteria (either initially or after revisions), the reviewer(s) formally approve it.
    *   **Responsibility:** Assigned Reviewer(s).

9.  **Update Asset Status/Metadata:**
    *   **Action:** Update the asset's status in the KM system to 'Approved' or 'Validated'. Update metadata such as 'Last Reviewed Date', 'Reviewer(s)', and potentially adjust the 'Next Review Date'. Make the asset visible/published if it was previously pending review.
    *   **Responsibility:** Knowledge Owner or KM System (automated).

10. **End Review Cycle:**
    *   **Action:** The review cycle for this instance is complete.

## 6. Roles and Responsibilities

- **Knowledge Owner:** Initiates review for new assets, assigns reviewers (or requests assignment), revises assets based on feedback, ensures final updates.
- **Reviewer(s) (SMEs, Peers, Managers):** Conduct thorough reviews based on criteria, provide clear feedback, approve assets meeting standards.
- **KM Unit:** Defines review criteria, manages review workflows in KM systems, provides guidance, may facilitate reviews or assign reviewers in some cases, monitors process effectiveness.
- **KM System:** May automate notifications, status updates, and review date tracking.

## 7. Tools

- Knowledge Management Platform (with review workflow capabilities)
- Collaboration Tools (for feedback and discussion)
- Email
- Review Checklists (Provided by KM Unit)

## 8. Related Documents

- [Knowledge Management Charter](../Charter.md)
- [Knowledge Creation Policy](../Policies/KnowledgeCreationPolicy.md)
- [Knowledge Retention Policy](../Policies/KnowledgeRetentionPolicy.md)
- [Data Classification Policy (KM Context)](../Policies/DataClassificationPolicy.md)
- [Knowledge Capture Process](KnowledgeCaptureProcess.md)

---
**Process Owner:** Knowledge Management Unit
**Date Effective:** [Date]
**Next Review Date:** [Date + 1 Year] 