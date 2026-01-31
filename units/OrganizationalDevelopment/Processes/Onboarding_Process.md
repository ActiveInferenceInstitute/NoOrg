# Onboarding Process

## 1. Purpose
To effectively integrate new hires into the organization, ensuring they have the knowledge, tools, and connections needed to become productive and engaged members of the team. This process covers activities from offer acceptance through the initial period of employment (e.g., 90 days).

## 2. Scope
- All regular full-time and part-time new hires.
- Roles and responsibilities of Hiring Manager, HR/OD, IT, Buddy (if applicable), and the New Hire.

## 3. Process Steps

### Phase 1: Pre-Boarding (Offer Acceptance to Day 1)

```mermaid
graph TD
    A[Offer Accepted] --> B{HR: Initiate Pre-boarding};
    B --> C[HR: Background Check & Verification];
    C --> D[HR: Send Welcome Packet & Forms];
    B --> E[IT: Provision Accounts & Hardware];
    B --> F[Hiring Manager: Prepare Workspace & Initial Plan];
    B --> G[Hiring Manager: Assign Buddy (Optional)];
    D --> H[New Hire: Complete Paperwork];
    E --> I{Systems Ready};
    F --> J{Workspace Ready};
    G --> K{Buddy Briefed};
    H --> L{Paperwork Complete};
    subgraph Pre-Boarding Tasks
        direction LR
        C; D; E; F; G; H;
    end
    I & J & K & L --> M[Ready for Day 1];
```text

1.  **HR:** Initiates pre-boarding upon offer acceptance.
    -   Completes background checks/verifications ([[Policy:Background_Check]]).
    -   Sends welcome email/packet including required forms, benefits information, and Day 1 logistics.
    -   Enters new hire data into [[Human_Resources_Information_System_HRIS]].
2.  **IT:** Provisions necessary accounts (email, system access) and hardware based on role requirements.
3.  **Hiring Manager:**
    -   Prepares physical/virtual workspace.
    -   Develops an initial 30/60/90-day plan outlining key goals and activities.
    -   Assigns a peer buddy (if applicable) and briefs them.
    -   Coordinates team introductions.
4.  **New Hire:** Completes required pre-employment paperwork.

### Phase 2: Day 1 - Week 1

```mermaid
graph TD
    N[Day 1 Start] --> O{HR/Manager: Official Welcome};
    O --> P[IT: Setup & Support];
    O --> Q[Manager: Workspace/Tool Orientation];
    O --> R[Manager: Review 30-Day Plan & Initial Tasks];
    O --> S[Manager/Buddy: Team Introductions];
    O --> T[HR: Benefits Enrollment & Policy Review];
    T --> U[New Hire: Complete Mandatory Training (e.g., Compliance)];
    P & Q & R & S & U --> V{First Week Integration};
```text

1.  **HR/Manager:** Formal welcome, provide company swag (if applicable).
2.  **IT:** Assists with final setup, confirms system access, provides support.
3.  **Manager:**
    -   Gives tour/orientation of workspace/tools.
    -   Reviews Day 1/Week 1 schedule and initial 30-day plan/goals.
    -   Facilitates introductions to the immediate team and key stakeholders.
    -   Sets up initial check-in meetings.
4.  **HR:** Conducts HR orientation (benefits enrollment, key policies, [[Employee_Handbook]] review).
5.  **New Hire:** Completes essential Day 1 tasks, begins mandatory compliance training (e.g., security, code of conduct) via [[Learning_Management_System_LMS]].
6.  **Buddy (if assigned):** Helps navigate informal culture, answers questions, facilitates social integration.

### Phase 3: First 90 Days

```mermaid
graph TD
    W[Start Week 2] --> X{Regular Manager Check-ins};
    X --> Y[Performance Goal Setting (within 30 days)];
    X --> Z[Ongoing Learning & Role Integration];
    X --> A1[Feedback (Formal/Informal)];
    Z --> B1[Cross-functional Introductions/Meetings];
    Y --> C1{Goals Set in System};
    A1 --> D1{Address Questions/Concerns};
    X --> E1[30-Day Checkpoint Review];
    E1 --> F1[60-Day Checkpoint Review];
    F1 --> G1[90-Day Performance Review];
    G1 --> H1{End of Formal Onboarding Period};
    subgraph Ongoing Activities
        direction LR
        X; Y; Z; A1; B1;
    end
```text

1.  **Manager:**
    -   Conducts regular (e.g., weekly) check-in meetings.
    -   Collaborates with New Hire to finalize performance goals within the first 30 days, aligned with [[Policy:Performance_Management]].
    -   Provides ongoing feedback, coaching, and support.
    -   Facilitates introductions to broader stakeholders.
    -   Conducts formal check-ins at 30, 60, and 90 days to review progress, goals, and integration.
2.  **New Hire:**
    -   Actively engages in learning about the role, team, and organization.
    -   Works towards achieving initial performance goals.
    -   Seeks feedback and clarification.
    -   Completes assigned training.
    -   Builds relationships within the team and cross-functionally.
3.  **HR/OD:** Checks in periodically, provides resources, gathers feedback on the onboarding experience.

## 4. Roles and Responsibilities
-   **New Hire:** Actively participate, complete tasks, ask questions, seek feedback.
-   **Hiring Manager:** Own the overall onboarding experience for their hire, provide context, set expectations, facilitate integration, conduct check-ins.
-   **HR/OD:** Manage pre-boarding logistics, conduct HR orientation, provide resources, track completion, evaluate process effectiveness.
-   **IT:** Ensure timely provision and setup of accounts and equipment.
-   **Buddy (Optional):** Provide informal guidance and support, help with social integration.
-   **Team Members:** Welcome the new hire, offer support and information.

## 5. Key Tools & Resources
-   [[Human_Resources_Information_System_HRIS]]
-   [[Learning_Management_System_LMS]]
-   [[Applicant_Tracking_System_ATS]] (Data handover)
-   Onboarding Checklists (for Manager, New Hire, HR)
-   Welcome Packet
-   [[Employee_Handbook]]
-   Benefits Information Portal
-   IT Service Desk

## 6. Metrics & Evaluation
-   New hire satisfaction surveys (e.g., at 30/90 days).
-   Time to productivity (Manager assessment).
-   90-day retention rate.
-   Completion rates of onboarding tasks/training.
-   Feedback from Hiring Managers.

## 7. Related Policies & Processes
-   [[Policy:Talent_Acquisition]]
-   [[Policy:Background_Check]]
-   [[Policy:Performance_Management]]
-   [[Policy:Code_of_Conduct]]
-   [[Policy:IT_Acceptable_Use]]
-   [[Process:IT_Provisioning]]

## 8. Process Review
-   This process will be reviewed annually by HR/OD based on feedback and metrics.

---
**Metadata**
- Process ID: [PROC-OD-001]
- Version: 1.0
- Owner: [[Head of Organizational Development]] / [[Head of Human Resources]]
- Last Updated: <% tp.date.now("YYYY-MM-DD") %> 