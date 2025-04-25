# Innovation Lifecycle Process Diagram

This diagram visualizes the end-to-end Innovation Lifecycle Process described in [../Processes/Innovation_Lifecycle_Process.md](../Processes/Innovation_Lifecycle_Process.md).

```mermaid
graph TD
    subgraph "Stage 1: Ideation & Submission"
        A[Problem/Opportunity Identified] --> B(Idea Generation);
        B --> C{Submit Idea};
    end

    subgraph "Gate 1: Initial Screening"
        C --> G1{Screening: Complete? Non-Duplicate? Strategic Fit?};
    end

    subgraph "Stage 2: Evaluation & Concept Dev"
        G1 -- Yes --> D[Evaluate Idea];
        D --> E[Develop Concept Brief];
    end

    subgraph "Gate 2: Concept Review"
        E --> G2{Concept Review: Potential? Feasible? Resources?};
    end

    subgraph "Stage 3: Experimentation & Validation"
        G2 -- Yes --> F[Design Experiment Plan];
        F --> G[Build Prototype/MVP];
        G --> H[Run Experiment / Test];
        H --> I[Analyze Results & Learnings];
        I --> G;  // Iteration loop within Experimentation
    end

    subgraph "Gate 3: Validation Review"
        I --> G3{Validation Review: Hypothesis Validated? Viable?};
    end

    subgraph "Stage 4: Pilot & Business Case Refinement"
        G3 -- Yes --> J[Design & Run Pilot];
        J --> K[Gather Operational Data];
        K --> L[Refine Business Case & Implementation Plan];
    end

    subgraph "Gate 4: Pre-Scale Review"
        L --> G4{Pre-Scale Review: Business Case Strong? Ready for Ops?};
    end

    subgraph "Stage 5: Scaling / Implementation / Transition"
        G4 -- Yes --> M[Full Scale Development / Rollout];
        M --> N[Transition to Business Unit / Operations];
        N --> O[Monitor Post-Launch];
    end

    subgraph "End/Hold States"
        G1 -- No --> R(Reject / Hold Idea);
        G2 -- No --> R;
        G3 -- Pivot --> E; // Pivot back to Concept Dev
        G3 -- No/Terminate --> S(Terminate Project);
        G4 -- No/Terminate --> S;
    end

    style R fill:#f9f,stroke:#333,stroke-width:2px
    style S fill:#f9f,stroke:#333,stroke-width:2px
```

**Diagram Key:**
- Rectangles: Process Steps/Activities
- Diamonds: Decision Gates
- Rounded Rectangles: End States (Reject/Hold/Terminate) or Start Point
- Arrows: Flow Direction
- Dashed Arrows: Optional/Iterative Paths 