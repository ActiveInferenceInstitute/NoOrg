# Human Resources Onboarding Process

## 1. Purpose

This document outlines the standard process for welcoming and integrating new employees into the organization. The goal is to provide a positive and consistent onboarding experience that helps new hires become productive, engaged, and culturally assimilated quickly and effectively.

## 2. Scope

This process covers the period from offer acceptance through the initial months of employment (typically the first 90 days), encompassing pre-boarding, first day/week activities, and ongoing integration efforts.

## 3. Roles and Responsibilities

*   **[[../index|Human Resources (HR)]] / Onboarding Specialist:** Owns the overall process, manages administrative tasks (paperwork, system setup), coordinates logistics, delivers initial HR orientation, and acts as a point of contact.
*   **Hiring Manager:** Plays a critical role in welcoming the new hire, setting expectations, facilitating team introductions, assigning initial tasks, providing regular check-ins, and managing the 30-60-90 day plan.
*   **[[../../InformationTechnology/index|IT Department]]:** Sets up necessary hardware, software, system access, and email accounts.
*   **[[../../Facilities/index|Facilities Department]] (if applicable):** Prepares workspace, access badges, etc.
*   **Buddy/Mentor (Optional):** An assigned peer to help the new hire navigate day-to-day questions and company culture.
*   **New Hire:** Actively participates in onboarding activities, completes required paperwork and training, asks questions, and seeks feedback.

## 4. Process Phases & Key Activities

**Phase 1: Pre-Boarding (Offer Acceptance to Start Date)**

1.  **Offer Acceptance Confirmation:** HR confirms acceptance and start date.
2.  **Background Check Completion:** Ensure all contingencies are met.
3.  **New Hire Paperwork:** HR sends/provides access to required documents (e.g., I-9, W-4, direct deposit, policy acknowledgements like [[../Policies/CodeOfConductPolicy|Code of Conduct]]) via [HRIS/System Name or secure method] for completion prior to Day 1 where possible.
4.  **System Account Creation:** HR initiates requests for IT (email, system access) and Facilities (workspace, badge).
5.  **Internal Notifications:** HR notifies relevant departments (IT, Facilities, [[../../Finance/index|Payroll]], Hiring Manager) of the new hire's start date and requirements.
6.  **Welcome Communication:** Hiring Manager or HR sends a welcome message outlining first-day logistics.
7.  **Equipment Preparation:** IT prepares laptop, phone, etc. Facilities prepares workspace.

**Phase 2: First Day / First Week**

8.  **Welcome & Introductions:** Hiring Manager greets the new hire, introduces them to the team and key stakeholders.
9.  **Workspace & Equipment Setup:** Ensure workstation is ready, logins work, equipment is functional (IT support available).
10. **HR Orientation:** HR covers essential [[../Policies/|policies]], benefits enrollment overview, payroll information, company culture/values, and completes any outstanding paperwork (e.g., I-9 verification).
11. **Initial Role & Team Context:** Hiring Manager discusses the role, team goals, initial expectations, and provides an overview of key projects/priorities.
12. **Buddy Introduction (if applicable):** Introduce the new hire to their assigned buddy/mentor.
13. **Initial Tasks & 30-Day Plan:** Hiring Manager assigns initial manageable tasks and discusses the 30-day goals/plan.
14. **Mandatory Training:** Assign required compliance or role-specific training (see [[../../TrainingDevelopment/index|Training & Development]]).

**Phase 3: First 90 Days (Integration & Performance Ramp-up)**

15. **Regular Check-ins:** Hiring Manager conducts frequent (e.g., weekly) check-ins to provide feedback, answer questions, monitor progress, and adjust plans.
16. **Goal Setting:** Formalize performance goals for the initial period and beyond (see [[PerformanceManagementProcess]]).
17. **Cross-functional Introductions:** Facilitate introductions to key collaborators in other departments.
18. **Training & Development:** Ensure completion of mandatory training and identify any additional learning needs.
19. **Performance Feedback:** Provide ongoing constructive feedback.
20. **30/60/90-Day Reviews:** Hiring Manager conducts formal check-in meetings at key milestones to review progress, goals, and gather feedback on the onboarding experience.
21. **Benefits Enrollment Deadline:** HR ensures benefits enrollment is completed within the required timeframe.
22. **Full Integration:** New hire demonstrates understanding of their role, team dynamics, company culture, and is contributing effectively.

## 5. Process Flowchart (Mermaid - Phased Approach)

```mermaid
graph TD
    A[Start: Offer Accepted] --> P1_Start(Phase 1: Pre-Boarding);
    subgraph P1_Start [Phase 1: Pre-Boarding]
        B(Confirm Acceptance & Start Date);
        C(Complete Background Checks);
        D(Send/Collect New Hire Paperwork - I-9, W4, [[../Policies/CodeOfConductPolicy|CoC Ack]]);
        E(Initiate IT/Facilities Setup Requests);
        F(Notify Internal Stakeholders);
        G(Send Welcome Communication);
        H(Prepare Workspace & Equipment);
    end
    P1_Start --> P2_Start(Phase 2: First Day / Week);
    subgraph P2_Start [Phase 2: First Day / Week]
        I(Welcome & Team Intros HM);
        J(Workspace & Equip Check IT/Fac);
        K(HR Orientation - Policies, Benefits, Payroll);
        L(Role/Team Overview & Expectations HM);
        M(Buddy Introduction Opt);
        N(Assign Initial Tasks & 30-Day Plan HM);
        O(Assign Mandatory Training);
    end
    P2_Start --> P3_Start(Phase 3: First 90 Days);
    subgraph P3_Start [Phase 3: First 90 Days]
        P(Regular HM Check-ins);
        Q(Formalize Performance Goals);
        R(Cross-Functional Intros);
        S(Complete Training);
        T(Provide Ongoing Feedback);
        U(30/60/90-Day Reviews HM);
        V(Ensure Benefits Enrollment HR);
        W(Achieve Integration);
    end
    P3_Start --> Z[End: Onboarding Complete];

    %% Dependencies
    A --> B --> C --> D --> E --> F --> G --> H;
    H --> P2_Start;
    I & J & K & L & M & N & O --> P3_Start;
    U -.- Z;
    W --> Z;
```

## 6. Key Metrics

*   New Hire Satisfaction (measured via surveys at 30/90 days)
*   Time to Productivity (often assessed by Hiring Manager)
*   Retention Rate of New Hires (at 90 days, 6 months, 1 year)
*   Completion Rates (Paperwork, Training, Benefits Enrollment)

## 7. Tools & Resources

*   HRIS / Onboarding System [Specify Name]
*   New Hire Checklist (for HR, HM, New Hire)
*   Welcome Packet
*   Benefits Enrollment Platform
*   Learning Management System (LMS)

## 8. Review Cycle

This process and associated materials (checklists, surveys) will be reviewed annually by [[../index|HR]] and key stakeholders (e.g., sample of Hiring Managers, recently onboarded employees) to ensure effectiveness and a positive new hire experience. 