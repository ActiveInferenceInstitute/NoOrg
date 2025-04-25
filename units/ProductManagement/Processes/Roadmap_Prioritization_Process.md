# Roadmap Prioritization Process

**Version:** 1.0
**Date:** {{Current Date}}
**Process Owner:** Head of Product
**Applies To:** Product Managers and stakeholders involved in roadmap planning and prioritization.

## 1. Purpose

This document describes the process for prioritizing initiatives, features, and other work items for inclusion in the product roadmap. The goal is to ensure a consistent, transparent, and objective approach to prioritization that aligns with strategic goals, maximizes value delivery, and balances competing demands.

## 2. Process Overview

Roadmap prioritization is a recurring activity, typically conducted on a [Specify Cadence, e.g., Quarterly] basis, aligned with strategic planning cycles. It involves evaluating potential roadmap candidates against defined criteria and using a chosen framework to rank them. The outcome informs the roadmap communicated according to the [[../Policies/Product_Roadmap_Policy.md]].

## 3. Prioritization Framework

The primary framework used for roadmap prioritization is [Specify Framework, e.g., RICE, Value vs. Effort, MoSCoW, Weighted Scoring].

**Example: Weighted Scoring**

*(If using Weighted Scoring, define the criteria and weights. Example below)*

| Criteria                     | Weight | Description                                                                 | Scale (1-5)                |
| :--------------------------- | :----- | :-------------------------------------------------------------------------- | :------------------------- |
| **Strategic Alignment**      | 30%    | How well does this align with key company/product strategic objectives?       | 1=Low Align, 5=High Align  |
| **Customer Value / Impact**  | 30%    | How significant is the benefit/pain solved for target customers?            | 1=Low Impact, 5=High Impact|
| **Business Value / Revenue** | 20%    | Potential impact on revenue, cost savings, market share, or other KPIs?    | 1=Low Value, 5=High Value  |
| **Effort / Cost**            | 15%    | Estimated effort/complexity/cost to implement (Note: Lower effort = Higher Score) | 1=Very High, 5=Very Low    |
| **Confidence**               | 5%     | How confident are we in the estimates for value and effort?                 | 1=Low Conf, 5=High Conf    |

*   **Score Calculation:** (Strategic Alignment Score * 0.30) + (Customer Value Score * 0.30) + (Business Value Score * 0.20) + (Effort Score * 0.15) + (Confidence Score * 0.05)
*   Items are ranked based on their total score.

**Example: RICE**

*   **Reach:** How many customers will this impact within a defined time period?
*   **Impact:** How much will this impact individual customers (e.g., 3=Massive, 2=High, 1=Medium, 0.5=Low, 0.25=Minimal)?
*   **Confidence:** How confident are we in the Reach, Impact, and Effort estimates (e.g., 100%, 80%, 50%)?
*   **Effort:** Estimated person-months required.
*   **Score Calculation:** (Reach * Impact * Confidence) / Effort

*(Select and detail the chosen framework)*

## 4. Process Steps

1.  **Input Gathering & Candidate Identification:**
    *   Product Managers consolidate potential roadmap items from various sources (discovery outputs, stakeholder requests, backlog items, strategic initiatives). See [[User_Feedback_Collection_Process.md]] & [[Product_Discovery_Process.md]].
    *   Ensure each candidate has sufficient definition (problem statement, proposed solution, target audience).
2.  **Initial Assessment & Sizing (Product Management & Engineering):**
    *   Product Managers perform an initial assessment against the chosen prioritization criteria.
    *   Collaborate with Engineering Leads to get high-level effort estimates (e.g., T-shirt sizes, story points range, person-months).
3.  **Scoring & Ranking (Product Management):**
    *   Product Managers score each item using the defined framework and criteria.
    *   Generate an initial ranked list of candidates.
4.  **Prioritization Review Meeting:**
    *   **Frequency:** [Specify Cadence, e.g., Quarterly]
    *   **Attendees:** Head of Product, Product Managers, Key Stakeholders (e.g., Heads of Engineering, Marketing, Sales).
    *   **Purpose:** Review the ranked list, discuss assumptions and scores, consider dependencies, capacity constraints, and strategic balance (e.g., mix of feature work, tech debt, experiments). Make qualitative adjustments to the ranking as needed based on discussion.
    *   **Outcome:** A finalized prioritized list of items intended for the upcoming roadmap horizon(s).
5.  **Roadmap Allocation & Communication:**
    *   Allocate prioritized items to roadmap timeframes (e.g., Now, Next, Later) based on capacity, dependencies, and strategic sequencing.
    *   Communicate the updated roadmap according to the [[../Policies/Product_Roadmap_Policy.md]].

## 5. Roles & Responsibilities

*   **Product Manager:** Gathers inputs, prepares candidates, performs initial scoring, collaborates on sizing, presents items during review, updates roadmap tool.
*   **Head of Product:** Owns the process, facilitates the prioritization review meeting, ensures consistency and strategic alignment.
*   **Engineering Lead(s):** Provide effort estimates and feasibility input.
*   **Stakeholders:** Provide input on business value, market impact, and strategic context during the review meeting.

## 6. Handling Urgent Requests / Changes

Urgent items arising outside the regular cycle must be evaluated against currently planned work using the same prioritization framework. Significant changes require following the change management process defined in the [[../Policies/Product_Roadmap_Policy.md]].

## 7. Tooling

Prioritization scoring and roadmap visualization may be managed in:

*   Spreadsheets (for scoring)
*   Roadmapping tools (Aha!, Productboard, Jira Align)
*   Project Management tools (Jira with custom fields)

## 8. Process Review

This process, including the chosen framework and criteria, will be reviewed annually or as needed to ensure its effectiveness.

## 9. Related Documents

*   [[../Charter.md]]
*   [[../Policies/Product_Roadmap_Policy.md]]
*   [[Product_Discovery_Process.md]]
*   [[User_Feedback_Collection_Process.md]] 