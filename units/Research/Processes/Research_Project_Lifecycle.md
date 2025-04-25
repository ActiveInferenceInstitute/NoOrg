# Research Project Lifecycle Process

**Version:** 1.0
**Date:** YYYY-MM-DD
**Status:** Draft
**Owner:** Research Unit Lead

## 1. Purpose

This document outlines the standard lifecycle stages for research projects undertaken by the Research Unit, from initial ideation through to completion and closure.

## 2. Scope

This process applies to all formal research projects conducted within the Research Unit.

## 3. Process Flow

```mermaid
graph TD
    A[Ideation / Proposal] --> B{Feasibility & Review};
    B -- Approved --> C[Planning];
    B -- Rejected --> D[Archive Idea];
    C --> E[Execution / Data Collection];
    E --> F[Data Analysis];
    F --> G[Interpretation & Reporting];
    G --> H{Dissemination / Publication?};
    H -- Yes --> I[[Publication_Workflow.md]];
    H -- No --> J[Internal Reporting / Archiving];
    I --> J;
    J --> K[Project Closure];
    K --> L[Data Archiving / Retention];
    
    subgraph Stages
        A
        B
        C
        E
        F
        G
        H
        I
        J
        K
        L
    end

    subgraph Key Activities / Outputs
        A --> A1(Research Question / Hypothesis);
        C --> C1(Research Plan / [[DMP_Creation_Process.md|DMP]]);
        E --> E1(Raw Data / Observations);
        F --> F1(Processed Data / Results);
        G --> G1(Findings / Conclusions);
        I --> I1(Manuscript / Presentation);
        J --> J1(Internal Report);
        K --> K1(Final Project Report);
        L --> L1(Archived Dataset);
    end
```

## 4. Stages Description

1.  **Ideation / Proposal:** Generating research ideas, formulating research questions/hypotheses, initial literature review, and potentially drafting a preliminary proposal.
2.  **Feasibility & Review:** Assessing the viability of the idea (resources, technical feasibility, ethical considerations), alignment with strategic goals, and formal proposal review (if applicable). Requires go/no-go decision.
3.  **Planning:** Detailed project planning, including methodology finalization, resource allocation, timeline development, risk assessment, ethical approvals (if needed), and creating the Data Management Plan (DMP) following the [[DMP_Creation_Process.md]] and per [[../Policies/Data_Handling_Policy.md]].
4.  **Execution / Data Collection:** Implementing the research plan, collecting data according to defined protocols, and initial data quality checks.
5.  **Data Analysis:** Processing raw data, performing statistical analysis or other analytical methods as defined in the plan. See [[Data_Analysis_Workflow.md]].
6.  **Interpretation & Reporting:** Interpreting analysis results, drawing conclusions, identifying limitations, and drafting initial findings/reports.
7.  **Dissemination / Publication:** Deciding on the dissemination strategy. If external publication is pursued, follow the [[Publication_Workflow.md]]. Otherwise, prepare findings for internal reporting and archiving.
8.  **Project Closure:** Finalizing all project documentation, reporting final outcomes, conducting lessons-learned session (optional), and formally closing the project.
9.  **Data Archiving / Retention:** Archiving final datasets, code, and documentation according to the DMP and [[../Policies/Data_Handling_Policy.md]]. Ensuring compliance with retention schedules.

## 5. Roles & Responsibilities

*   **Researcher/PI:** Leads the project through all stages, responsible for planning, execution, analysis, reporting, and adherence to policies/processes.
*   **Research Unit Lead:** Provides oversight, approves proposals/plans, allocates resources.
*   **Team Members:** Contribute to specific stages as assigned.
*   **[Ethics Committee]:** Reviews and approves protocols involving human/animal subjects.
*   **[IT/Data Management Support]:** Provides support for data storage, security, and archiving.

## 6. Related Documents

*   [[../Charter.md]]
*   [[../Policies/Research_Ethics_Policy.md]]
*   [[../Policies/Data_Handling_Policy.md]]
*   [[DMP_Creation_Process.md]]
*   [[Data_Analysis_Workflow.md]]
*   [[Publication_Workflow.md]]
*   [Project Proposal Template]
*   [Data Management Plan Template]

## 7. Review Cycle

This process document will be reviewed annually. 