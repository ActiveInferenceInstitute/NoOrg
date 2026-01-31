# Internal Peer Review Process

**Version:** 1.0
**Date:** YYYY-MM-DD
**Status:** Draft
**Owner:** Research Unit Lead

## 1. Purpose

To establish a process for internal peer review of research outputs (e.g., draft reports, manuscripts, analysis plans, code) within the Research Unit to enhance quality, rigor, and clarity before finalization or external submission.

## 2. Scope

This process applies to designated research outputs requiring internal quality assurance review, as determined by the Research Unit Lead or project requirements.

## 3. Process Flow

```mermaid
graph TD
    A[Author Completes Draft Output] --> B{Internal Review Required?};
    B -- Yes --> C[Identify & Assign Reviewer(s)];
    B -- No --> G[Finalize Output];
    C --> D[Reviewer Conducts Review];
    D --> E[Reviewer Provides Feedback to Author];
    E --> F{Author Addresses Feedback / Revises};
    F -- Revisions Accepted --> G;
    F -- Major Revisions / Disagreement --> H{Discussion / Resolution (Author, Reviewer, Lead)};
    H --> F;

    subgraph Steps
        A; B; C; D; E; F; G; H;
    end

    subgraph Key Considerations / Inputs
        A --> A1(Draft Document / Code);
        C --> C1(Review Criteria / Checklist - Optional);
        D --> D1(Reviewer Expertise);
        E --> E1(Constructive Feedback);
        F --> F1(Revised Output / Response to Reviewer);
    end
```text

## 4. Steps Description

1.  **Author Completes Draft:** The author(s) finalize a draft version of the research output intended for review.
2.  **Determine Review Need:** Decide if internal peer review is necessary based on the output type, project guidelines, or potential impact.
3.  **Assign Reviewer(s):** The Research Unit Lead or designated person identifies one or more suitable internal reviewers with relevant expertise, avoiding conflicts of interest.
4.  **Conduct Review:** The reviewer(s) evaluate the draft based on criteria such as clarity, methodology soundness, accuracy of analysis/results, logical flow, adherence to standards/policies, and completeness. A checklist may be provided.
5.  **Provide Feedback:** Reviewer(s) provide constructive, specific feedback to the author(s) within an agreed timeframe, highlighting strengths and areas for improvement.
6.  **Address Feedback / Revise:** The author(s) consider the feedback, revise the output accordingly, and may provide a response to the reviewer(s).
7.  **Finalize Output:** Once revisions are satisfactory (potentially after minor iteration with the reviewer), the output is considered finalized from the internal review perspective.
8.  **Discussion / Resolution:** If there are major disagreements or significant revisions required, a discussion involving the author(s), reviewer(s), and potentially the Research Unit Lead is held to reach a resolution.

## 5. Reviewer Selection & Expectations

*   Reviewers should possess relevant subject matter or methodological expertise.
*   Reviewers should be able to provide objective, constructive feedback in a timely manner.
*   Reviewers should maintain confidentiality regarding the reviewed material.
*   Efforts should be made to distribute review workload equitably.

## 6. Timelines

*   Establish expected turnaround times for review requests and feedback provision (e.g., 1-2 weeks, depending on complexity).

## 7. Related Documents

*   [[Research_Project_Lifecycle.md]]
*   [[Publication_Workflow.md]]
*   [[../Policies/Research_Ethics_Policy.md]]
*   [Review Checklist Template (Optional)]

## 8. Review Cycle

This process document will be reviewed annually. 