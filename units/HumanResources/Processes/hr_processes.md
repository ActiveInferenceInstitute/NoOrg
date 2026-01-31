# Human Resources (HR) Processes

## 1. Introduction
This document outlines the standard operating processes for key Human Resources functions. These processes are designed to ensure efficiency, consistency, fairness, and compliance across the employee lifecycle.

## 2. Core Processes

### 2.1. Recruitment and Selection Process ([[recruitment_selection_process]])
- **Objective:** To attract, assess, and hire the most qualified candidates for open positions in a timely and compliant manner.
- **Systems:** [[applicant_tracking_system]] (ATS), [[hr_information_system]] (HRIS)
- **Steps:**
    1.  **Job Requisition:** Hiring Manager identifies need, defines role [[Job Descriptions]], and submits requisition for approval (Finance/HR).
    2.  **Sourcing Strategy:** Recruiter develops sourcing plan (internal posting, external job boards, agencies, referrals).
    3.  **Candidate Screening:** Recruiter screens applications/resumes in ATS against minimum qualifications.
    4.  **Interviews:** Structured interviews conducted by Recruiter, Hiring Manager, and designated interview panel. [[Interview and Selection Process Policy]]
    5.  **Assessment (Optional):** Skills tests, presentations, or other assessments may be used.
    6.  **Reference Checks:** Conducted for final candidate(s).
    7.  **Background Check:** Initiated per [[Background Check Policy]].
    8.  **Offer:** Offer details finalized (Comp/Ben team input), extended to candidate, and negotiated if necessary. [[Offer of Employment Policy]]
    9.  **Hire & Onboarding Initiation:** Candidate accepts, offer letter signed, ATS updated, HRIS record created, onboarding process triggered.

### 2.2. New Hire Onboarding Process ([[new_hire_onboarding_process]])
- **Objective:** To integrate new employees smoothly into the organization, providing them with necessary information, tools, and connections to become productive quickly.
- **Systems:** [[hr_information_system]] (HRIS), [[learning_management_system]] (LMS), IT Service Desk
- **Steps:**
    1.  **Pre-Boarding:** HR completes hiring paperwork, coordinates with IT/Facilities for account/equipment setup, sends welcome information.
    2.  **Day 1:** Welcome, workspace setup check, initial HR/Compliance paperwork, IT login assistance, team introductions (Manager).
    3.  **Week 1:** HR orientation (policies, benefits enrollment), mandatory compliance training (LMS), role-specific training begins (Manager/Team), goal setting initiated.
    4.  **First 90 Days:** Regular check-ins (Manager/HR), completion of onboarding checklist, performance feedback, integration into team/culture.
    5.  **Onboarding Completion:** Formal check-in at ~90 days to review progress and address questions.

### 2.3. Performance Appraisal Cycle ([[performance_appraisal_cycle]])
- **Objective:** To provide regular, formal feedback on employee performance, identify development needs, and inform decisions related to compensation and promotion.
- **System:** [[performance_management_platform]]
- **Steps:**
    1.  **Goal Setting:** Employees and Managers set SMART goals at the beginning of the review period (e.g., annually).
    2.  **Ongoing Feedback:** Managers provide regular informal feedback and coaching throughout the year.
    3.  **Self-Assessment:** Employee completes self-assessment reflecting on performance against goals and competencies.
    4.  **Manager Assessment:** Manager evaluates employee performance, gathers feedback (if applicable), and drafts the review.
    5.  **Calibration (Optional):** Managers meet to discuss ratings for consistency across teams/departments.
    6.  **Performance Review Meeting:** Manager and employee meet to discuss the review, feedback, and development plan.
    7.  **Finalization & Sign-off:** Review finalized and acknowledged electronically in the system.
    8.  **Input to Other Processes:** Performance data informs compensation reviews and talent development planning.

### 2.4. Employee Relations Issue Resolution Process ([[employee_relations_issue_resolution]])
- **Objective:** To address employee complaints, conflicts, and performance issues fairly, consistently, and in compliance with policy and law.
- **Steps:**
    1.  **Issue Reporting:** Employee or Manager reports issue/complaint to HR or through designated channels [[Complaint Reporting and Investigation Procedure]].
    2.  **Intake & Assessment:** HR (Employee Relations Specialist/HRBP) gathers initial information, assesses severity and scope, reviews applicable policies.
    3.  **Investigation (If necessary):** Conduct confidential interviews, gather evidence, document findings objectively.
    4.  **Analysis & Findings:** HR analyzes findings, determines policy violations or other issues, consults with Legal if needed.
    5.  **Resolution Planning:** HR, in consultation with management (and Legal if needed), determines appropriate resolution (e.g., mediation, coaching, disciplinary action, policy clarification).
    6.  **Communication & Implementation:** Communicate resolution to relevant parties, implement actions (e.g., issue warning per [[Progressive Discipline Policy]], facilitate mediation).
    7.  **Documentation:** Thoroughly document the process, findings, and resolution in a confidential file.

### 2.5. Employee Offboarding Process ([[employee_offboarding_process]])
- **Objective:** To ensure a smooth, compliant, and respectful separation process for departing employees, while protecting organizational assets and information.
- **Steps:**
    1.  **Notification:** Employee provides resignation notice / Manager initiates termination process (following consultation with HR/Legal).
    2.  **Separation Documentation:** HR prepares separation agreement (if applicable), final pay calculations, benefits continuation information (COBRA, etc.).
    3.  **Manager Checklist:** Coordinate knowledge transfer, finalize performance documentation.
    4.  **Systems/Access Removal:** Notify IT/Facilities to schedule deactivation of accounts and revoke physical access upon departure.
    5.  **Asset Return:** Ensure return of all company property (laptop, phone, keys, ID badge).
    6.  **Exit Interview (Voluntary):** HR conducts exit interview to gather feedback.
    7.  **Final Pay & Benefits:** Process final paycheck according to state law, provide benefits end information.
    8.  **Record Update:** Update HRIS to reflect termination status.

## 3. Visualization: Recruitment & Selection Workflow

```mermaid
sequenceDiagram
    participant Hiring Mgr
    participant HR/Recruiter
    participant ATS
    participant Candidate
    participant Interview Panel
    participant Comp/Ben Team
    participant Background Check Vendor
    participant HRIS

    Hiring Mgr->>+HR/Recruiter: Submit Approved Requisition
    HR/Recruiter->>ATS: Create/Post Job Opening
    HR/Recruiter->>HR/Recruiter: Develop Sourcing Strategy
    Candidate->>+ATS: Apply for Job
    ATS->>-HR/Recruiter: Notify: New Applicant
    HR/Recruiter->>HR/Recruiter: Screen Applications (in ATS)
    HR/Recruiter->>+Candidate: Schedule Initial Screen
    HR/Recruiter->>-Candidate: Conduct HR Screen
    opt Proceed
        HR/Recruiter->>Hiring Mgr: Share Shortlisted Candidates
        Hiring Mgr->>HR/Recruiter: Select for Interviews
        HR/Recruiter->>+Interview Panel: Coordinate Interview Schedule
        HR/Recruiter->>+Candidate: Schedule Interviews
        Interview Panel->>-Candidate: Conduct Interviews
        Interview Panel->>HR/Recruiter: Provide Feedback (via ATS/Form)
        HR/Recruiter->>Hiring Mgr: Consolidate Feedback
        Hiring Mgr->>HR/Recruiter: Identify Final Candidate(s)
        HR/Recruiter->>Candidate: Conduct Reference Checks
        HR/Recruiter->>+Background Check Vendor: Initiate Background Check
        Background Check Vendor-->>-HR/Recruiter: Provide Results
        opt Clear Checks
            HR/Recruiter->>+Comp/Ben Team: Confirm Offer Details
            Comp/Ben Team-->>-HR/Recruiter: Finalize Compensation Package
            HR/Recruiter->>Hiring Mgr: Review/Approve Final Offer
            HR/Recruiter->>+Candidate: Extend Verbal Offer
            opt Negotiation
                Candidate-->>HR/Recruiter: Negotiate Terms
                HR/Recruiter-->>Candidate: Present Final Offer
            end
            Candidate-->>-HR/Recruiter: Accept Offer
            HR/Recruiter->>Candidate: Send Offer Letter
            HR/Recruiter->>ATS: Update Candidate Status (Hired)
            HR/Recruiter->>+HRIS: Initiate Hire Process
            HRIS-->>-HR/Recruiter: Confirm Record Creation
            HR/Recruiter->>Candidate: Trigger Onboarding Comms
            HR/Recruiter->>Hiring Mgr: Confirm Hire, Start Onboarding Coord.
        else Background Check Issue
            HR/Recruiter->>Hiring Mgr: Discuss Issue (Consult Legal if needed)
            HR/Recruiter->>Candidate: Rescind Offer (Following Policy)
        end
    else Do Not Proceed
         HR/Recruiter->>Candidate: Notify: Not Selected
         HR/Recruiter->>ATS: Update Candidate Status
    end
```text

---
Version: 1.0
Last Updated: [[Date]]
Maintained by: [[Head of HR]] 