# Knowledge Capture Process

## 1. Purpose

This document outlines the standard process for identifying, capturing, documenting, and storing valuable organizational knowledge (both explicit and tacit) to make it accessible and reusable, supporting the goals outlined in the [Knowledge Creation Policy](../Policies/KnowledgeCreationPolicy.md).

## 2. Scope

This process applies to all situations where valuable organizational knowledge is generated or identified, including projects, operational activities, research, problem-solving, expert interactions, and collaborative sessions.

## 3. Process Overview

The knowledge capture process involves identifying potentially valuable knowledge, selecting the appropriate capture method, documenting the knowledge according to standards, classifying and storing it correctly, and making it discoverable.

## 4. Workflow Diagram

```mermaid
graph TD
    A[Identify Knowledge Need/Opportunity] --> B{Explicit or Tacit?};
    B -- Explicit --> C[Select Documentation Method/Template];
    B -- Tacit --> D[Select Tacit Capture Method];

    C --> E[Document Knowledge Asset];
    D -- e.g., Interview --> F[Conduct Interview/Session];
    D -- e.g., CoP Discussion --> G[Facilitate & Summarize Discussion];
    D -- e.g., Mentoring --> H[Document Key Insights (Optional)];

    F --> E;
    G --> E;
    H --> E;

    E --> I{Review/Validation Needed?};
    I -- Yes --> J[Submit for Review (See Review Process)];
    I -- No --> K[Apply Metadata & Classification];

    J --> K;

    K --> L[Store in Designated Repository];
    L --> M[Notify Relevant Stakeholders (Optional)];
    M --> N[End];
    L --> N;

    subgraph Legend
        direction TB
        Start(((Start))) -.-> A
        Endd(((End))) -.-> N
        Process[Process Step]
        Decision{Decision}
    end

    style Start fill:#fff,stroke:#333,stroke-width:2px
    style Endd fill:#fff,stroke:#333,stroke-width:2px
```text

## 5. Process Steps

1.  **Identify Knowledge Need/Opportunity:**
    *   **Trigger:** Project milestones (e.g., lessons learned), completion of tasks, problem resolution, identification of a knowledge gap, expert departure, new process development, successful innovation, CoP insights.
    *   **Action:** Recognize that valuable knowledge has been created or is needed.
    *   **Responsibility:** All Employees, Managers, Project Managers, KM Unit.

2.  **Determine Knowledge Type (Explicit or Tacit):**
    *   **Action:** Assess if the knowledge is easily documented (explicit) or based on experience, intuition, and context (tacit).
    *   **Responsibility:** Knowledge Creator/Identifier.

3.  **Select Capture Method:**
    *   **Explicit Knowledge:** Choose the appropriate documentation method (e.g., SOP template, project report, Wiki page, presentation, technical document, meeting minutes template).
    *   **Tacit Knowledge:** Select a method to elicit and potentially codify the knowledge (e.g., structured interview, storytelling session, facilitated CoP discussion, peer assist, after-action review, expert debriefing, mentoring session summary).
    *   **Responsibility:** Knowledge Creator/Identifier, KM Unit (guidance).

4.  **Capture/Document Knowledge:**
    *   **Explicit:** Create the knowledge asset using the selected template/format. Adhere to clarity, completeness, and accuracy principles ([Knowledge Creation Policy](../Policies/KnowledgeCreationPolicy.md)).
    *   **Tacit:** Conduct the chosen session (interview, discussion, etc.). Document the key insights, processes, decisions, or context shared. This may result in a report, summary, recording (with consent), or updated explicit asset.
    *   **Responsibility:** Knowledge Creator, Interviewer/Facilitator, Documenter.

5.  **Determine Need for Review/Validation:**
    *   **Action:** Assess if the captured knowledge requires review by SMEs or peers for accuracy, completeness, or compliance (e.g., new SOPs, critical technical data, externally shared information).
    *   **Responsibility:** Knowledge Creator/Owner.

6.  **Submit for Review (If Needed):**
    *   **Action:** Initiate the [Knowledge Review and Validation Process](KnowledgeReviewProcess.md).
    *   **Responsibility:** Knowledge Owner.

7.  **Apply Metadata & Classification:**
    *   **Action:** Assign appropriate metadata tags (keywords, owner, review date, related topics) according to organizational taxonomy. Assign a data classification level according to the [Data Classification Policy](../Policies/DataClassificationPolicy.md).
    *   **Responsibility:** Knowledge Owner/Creator, KM Unit (support).

8.  **Store in Designated Repository:**
    *   **Action:** Upload/save the finalized knowledge asset to the appropriate official repository (e.g., Knowledge Base, SharePoint site, DMS) based on its type and classification. Ensure correct permissions are applied.
    *   **Responsibility:** Knowledge Owner/Creator.

9.  **Notify Relevant Stakeholders (Optional):**
    *   **Action:** Inform relevant teams, CoPs, or individuals about the newly available knowledge asset if appropriate.
    *   **Responsibility:** Knowledge Owner/Creator.

## 6. Roles and Responsibilities

- **All Employees:** Identify knowledge worth capturing, participate in capture activities, document their own knowledge where appropriate.
- **Managers:** Encourage and support knowledge capture within their teams.
- **SMEs:** Provide expertise during capture (e.g., interviews) and validation.
- **KM Unit:** Provide templates, tools, guidance, facilitation support, manage repositories, oversee the process.
- **Project Managers:** Ensure project-related knowledge (esp. lessons learned) is captured.

## 7. Tools

- Organizational Templates ([Link])
- Knowledge Base Platform ([Link])
- Document Management System ([Link])
- Collaboration Tools (e.g., Teams, Confluence)
- Recording Tools (Audio/Video - with consent)
- Interview Guides/Checklists (Provided by KM Unit)

## 8. Related Documents

- [Knowledge Management Charter](../Charter.md)
- [Knowledge Creation Policy](../Policies/KnowledgeCreationPolicy.md)
- [Knowledge Sharing Policy](../Policies/KnowledgeSharingPolicy.md)
- [Data Classification Policy (KM Context)](../Policies/DataClassificationPolicy.md)
- [Knowledge Review and Validation Process](KnowledgeReviewProcess.md)
- [Organizational Taxonomy/Metadata Standard] [Placeholder Link]

---
**Process Owner:** Knowledge Management Unit
**Date Effective:** [Date]
**Next Review Date:** [Date + 1 Year] 