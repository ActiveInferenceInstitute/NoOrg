# Idea Management Process Diagram

This diagram visualizes the Idea Management Process described in [../Processes/Idea_Management_Process.md](../Processes/Idea_Management_Process.md).

```mermaid
graph TD
    A[Submitter Has Idea] --> B{Submit via Platform/Form};
    B --> C[Idea Logged in System];
    C --> D(Send Acknowledgement to Submitter);

    subgraph Screening [Initial Screening by Innovation Unit]
        D --> E{Check: Complete? Clear? Duplicate? Aligned?};
        E -- Needs Info --> F[Contact Submitter for Clarification];
        F --> E;
        E -- Duplicate/Reject --> G[Notify Submitter & Archive];
    end

    subgraph Evaluation [Detailed Evaluation]
        E -- Pass Screening --> H[Assign to Review Body];
        H --> I[Evaluate Against Criteria];
        I --> J(Create Evaluation Scorecard/Recommendation);
    end

    subgraph Decision [Evaluation Review & Decision]
        J --> K{Review by Decision Body};
        K -- Accept for Experimentation --> L[Proceed to Stage 3: Experimentation];
        K -- Hold/Monitor --> M[Place in Backlog];
        K -- Reject --> N[Notify Submitter & Archive];
    end

    subgraph Feedback
      L --> O[Notify Submitter of Acceptance];
      M --> P[Notify Submitter of Hold Status];
      N --> Q[Notify Submitter of Rejection Rationale];
    end

    style G fill:#f9f,stroke:#333,stroke-width:2px
    style N fill:#f9f,stroke:#333,stroke-width:2px
    style L fill:#ccffcc,stroke:#333,stroke-width:2px // Accepted outcome
    style M fill:#ffffcc,stroke:#333,stroke-width:2px // Hold outcome

```text

**Diagram Key:**
- Rectangles: Process Steps/Activities
- Diamonds: Decision Points
- Rounded Rectangles: End States (Archive/Reject/Hold) or Start/External State (Proceed to Stage 3)
- Arrows: Flow Direction 