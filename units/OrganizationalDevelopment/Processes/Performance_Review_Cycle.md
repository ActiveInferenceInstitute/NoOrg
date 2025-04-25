# Performance Review Cycle Process

## 1. Purpose
To provide a structured and consistent process for formally evaluating employee performance against goals and competencies, facilitating development discussions, and informing talent decisions. This process supports the [[Policy:Performance_Management]].

## 2. Scope
- All regular employees eligible for performance reviews.
- Managers conducting reviews.
- HR/OD supporting the process.
- Typically follows an annual cycle, potentially with mid-year check-ins.

## 3. Process Steps

```mermaid
sequenceDiagram
    participant OD_HR as OD/HR
    participant Mgr as Manager
    participant Emp as Employee
    participant Leaders as Leadership

    Note over OD_HR, Leaders: Cycle Planning & Communication (Start of Cycle/Year)
    OD_HR->>Mgr: Announce Cycle Dates & Guidelines
    OD_HR->>Emp: Announce Cycle Dates & Guidelines

    Note over Mgr, Emp: Goal Setting Phase (Start of Cycle)
    Mgr->>Emp: Discuss & Set Performance Goals
    Emp->>Mgr: Provide Input on Goals
    Mgr->>OD_HR: Finalize Goals in System

    Note over Mgr, Emp: Ongoing Feedback & Mid-Year Check-in (Throughout Cycle)
    loop Regular Check-ins
        Mgr->>Emp: Provide Feedback & Coaching
        Emp->>Mgr: Discuss Progress & Challenges
    end
    Mgr->>Emp: Conduct Mid-Year Check-in (Optional/Recommended)

    Note over Mgr, Emp, OD_HR: Year-End Review Phase (End of Cycle)
    OD_HR->>Mgr: Initiate Year-End Review Process
    OD_HR->>Emp: Initiate Self-Assessment
    Emp->>OD_HR: Submit Self-Assessment
    Mgr->>OD_HR: Gather Feedback (e.g., 360, Peer - if applicable)
    Mgr->>OD_HR: Draft Performance Review & Rating

    Note over OD_HR, Leaders, Mgr: Calibration Phase
    OD_HR->>Leaders: Facilitate Calibration Meetings
    Leaders->>Mgr: Discuss Ratings & Ensure Consistency
    Mgr->>OD_HR: Finalize Ratings Post-Calibration

    Note over Mgr, Emp: Review Discussion & Finalization
    Mgr->>Emp: Schedule & Conduct Performance Review Meeting
    Emp->>Mgr: Discuss Performance, Feedback, Development
    Mgr->>OD_HR: Submit Final Signed Review
    OD_HR->>Mgr: Confirm Review Completion in System

    Note over OD_HR: Post-Cycle Analysis
    OD_HR->>OD_HR: Analyze Trends, Ratings Distribution
    OD_HR->>Leaders: Report on Cycle Outcomes & Process Effectiveness
```

**Detailed Steps:**

1.  **Planning & Communication (Start of Cycle):**
    *   OD/HR confirms the annual cycle timeline (e.g., Jan-Dec review period, Q1 review meetings).
    *   OD/HR communicates timelines, guidelines, rating scales, and system instructions to managers and employees.
2.  **Goal Setting (Start of Cycle):**
    *   Manager meets with Employee to discuss and set SMART performance goals, aligned with team/organizational objectives.
    *   Goals are documented in the [[Performance_Management_Software]].
3.  **Ongoing Performance & Development (Throughout Cycle):**
    *   Manager provides regular informal feedback and coaching.
    *   Manager and Employee have periodic check-ins (formal or informal).
    *   Optional/Recommended: Formal Mid-Year Check-in to review progress against goals and development plan.
4.  **Year-End Preparation (End of Cycle):**
    *   OD/HR notifies managers and employees to begin the year-end review process.
    *   Employee completes and submits a Self-Assessment in the system.
    *   Manager drafts the performance review, considering:
        *   Performance against goals.
        *   Demonstration of competencies/behaviors.
        *   Employee self-assessment.
        *   Feedback gathered throughout the year (and potentially formal 360/peer feedback if part of the process).
    *   Manager proposes an initial performance rating.
5.  **Calibration (Before Final Reviews):**
    *   OD/HR facilitates calibration meetings with leadership/managers.
    *   Managers discuss their teams' performance and proposed ratings to ensure consistency and fairness across the group.
    *   Ratings may be adjusted based on calibration discussions.
    *   Final calibrated ratings are confirmed.
6.  **Performance Review Meeting:**
    *   Manager schedules and conducts a formal performance review meeting with the Employee.
    *   Discussion covers performance achievements, areas for development, feedback, and confirmation of the final rating.
    *   Development goals for the upcoming cycle are discussed (links to [[Policy:Learning_Development]]).
7.  **Finalization & Documentation:**
    *   Manager and Employee finalize and acknowledge the review documentation (e.g., electronic signature in the system).
    *   OD/HR confirms completion and archives the review.
8.  **Post-Cycle Analysis:**
    *   OD/HR analyzes overall rating distributions, process compliance, and feedback on the cycle to identify areas for improvement.

## 4. Roles and Responsibilities
-   **Employee:** Actively participate in goal setting, self-assessment, check-ins, and review meeting; focus on development.
-   **Manager:** Drive the process for their team, set clear goals, provide ongoing feedback, draft/conduct reviews fairly, participate in calibration, support development.
-   **Second-Level Manager (Manager's Manager):** May review and approve direct reports' reviews for consistency.
-   **OD/HR:** Own and communicate the process, provide training and support, manage the system, facilitate calibration, analyze outcomes.
-   **Leadership:** Champion the process, participate in calibration, ensure accountability.

## 5. Key Tools & Resources
-   [[Performance_Management_Software]]
-   Performance Review Templates/Forms
-   Goal Setting Worksheet/Guide
-   Self-Assessment Form
-   [[Guideline:Performance_Rating_Scale]]
-   Manager Training Materials
-   Calibration Guidelines

## 6. Metrics & Evaluation
-   Review completion rates (on time).
-   Rating distribution analysis.
-   Employee/Manager feedback on the process (via surveys).
-   Correlation between performance ratings and other talent outcomes (e.g., promotion, retention - requires careful analysis).

## 7. Related Policies & Processes
-   [[Policy:Performance_Management]]
-   [[Policy:Compensation_Philosophy]] (Input for merit increases/bonuses)
-   [[Policy:Learning_Development]] (Input for development plans)
-   [[Policy:Employee_Discipline]] / [[Process:Performance_Improvement_Plan]] (For addressing underperformance identified during cycle)
-   [[Process:Goal_Setting]]
-   [[Process:Performance_Calibration]]

## 8. Process Review
-   Reviewed annually by OD/HR based on metrics and feedback.

---
**Metadata**
- Process ID: [PROC-OD-002]
- Version: 1.0
- Owner: [[Head of Organizational Development]]
- Last Updated: <% tp.date.now("YYYY-MM-DD") %> 