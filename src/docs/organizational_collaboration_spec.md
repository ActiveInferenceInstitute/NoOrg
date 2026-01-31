# Specification: Multi-Agent Organizational Collaboration System

## 1. Overview

This document specifies a system designed to facilitate collaborative planning and task execution by multi-LLM agents representing organizational units. The system leverages the structure, documents, and context defined within the `/units` directory to enable agents to work together sequentially, reviewing, improving, and composing work products like implementation plans.

The primary goal is to automate the initial phases of complex organizational planning by simulating the interaction and contribution of relevant departments or teams.

## 2. Core Concepts

*   **Organizational Unit:** Represents a department, team, or functional area within an organization. Defined by its directory structure, associated documents (e.g., policies, reports, meeting notes, READMEs), metadata (capabilities, expertise, points of contact), and relationships within `/units`.
*   **Unit Agent:** An LLM-powered agent instantiated to represent a specific Organizational Unit. It acts based on the unit's defined role, capabilities, and contextual information derived from its documents and relationships.
*   **Task:** A discrete piece of work assigned to a Unit Agent. Tasks have descriptions, inputs (context, previous outputs), dependencies, and produce outputs.
*   **Workflow:** A defined sequence of Tasks assigned to specific Unit Agents to achieve an overall goal (e.g., creating a plan). It dictates the flow of information and dependencies between tasks.
*   **Plan Document:** The central artifact being collaboratively created or modified. It evolves as different Unit Agents contribute, review, and refine sections.
*   **Shared State / Context:** Information accessible to the workflow coordinator and potentially passed to agents, including the current state of the Plan Document, workflow status, and summaries of relevant contextual information.
*   **Agent Memory:** Persistent storage for each agent, potentially containing past interactions, derived knowledge, or summaries relevant to its unit.

## 3. System Architecture

The system consists of the following core components:

1.  **Unit Discovery & Context Engine:**
    *   Responsible for parsing the `/units` directory structure at initialization.
    *   Identifies units, their primary markdown files (e.g., `README.md`, `charter.md`), and associated documents.
    *   Extracts metadata: unit name, description, defined capabilities/expertise (from markdown or config).
    *   Parses relationships (e.g., hierarchy from structure, `[[links]]` within markdown files).
    *   Optionally preprocesses or summarizes key documents for contextual retrieval.
2.  **Agent Manager / Registry:**
    *   Creates `Unit Agent` instances based on discovered units.
    *   Maps Unit IDs to Agent instances.
    *   Provides access to agents based on Unit ID or capabilities.
3.  **Task Manager:**
    *   Manages the lifecycle of tasks (create, assign, update status, track dependencies, store results).
    *   Provides querying capabilities for task status.
4.  **Workflow Coordinator:**
    *   The central orchestrator.
    *   Initializes the system (triggers Unit Discovery, Agent creation).
    *   Loads or defines the workflow sequence (which units perform which tasks in what order).
    *   Manages the execution flow based on the defined workflow.
    *   Dispatches tasks to the appropriate agents via the Task Manager.
    *   Manages the passing of context (e.g., the current Plan Document state, previous task outputs) to agents.
    *   Receives task results and triggers subsequent workflow steps.
    *   Handles workflow completion or failure.
5.  **Shared State Manager:**
    *   Holds the evolving Plan Document.
    *   Stores other relevant shared information (e.g., overall goal, key decisions, global context).
    *   Provides mechanisms for agents/coordinator to read and update state.
6.  **Unit Agent:**
    *   Executes assigned tasks.
    *   Constructs prompts for the LLM based on:
        *   Task description and input.
        *   Its represented Unit's identity, capabilities, and context (potentially including summaries of key unit documents).
        *   Relevant data from the Shared State (e.g., the current plan draft).
    *   Interacts with the LLM Client to get task execution results.
    *   Formats the output according to task requirements.
    *   Updates its internal memory (optional).
7.  **LLM Client:**
    *   Handles communication with the underlying LLM API (e.g., OpenAI).
    *   Manages API key, model selection, and basic request/response handling.

## 4. Workflow Logic (Example: Collaborative Plan Creation)

1.  **Initialization:**
    *   Coordinator triggers Unit Discovery to parse `/units`.
    *   Coordinator uses Agent Manager to create agents for relevant units.
    *   Coordinator defines the overall goal (e.g., "Create an implementation plan for Project X").
    *   Coordinator loads the workflow definition (e.g., a sequence like: Strategy -> Finance -> Operations -> Security -> Legal -> Final Review).
    *   Shared State is initialized (e.g., empty Plan Document structure).
2.  **Workflow Execution Loop:**
    *   **Step 1 (e.g., Strategy):**
        *   Coordinator creates an initial planning task ("Draft initial strategic outline for Project X plan").
        *   Coordinator dispatches the task to the `Strategy Agent` via the Task Manager, potentially providing high-level goals from Shared State.
        *   `Strategy Agent` processes the task (using LLM and its unit context), producing an initial draft section.
        *   Task Manager updates task status to 'completed' and stores the output.
    *   **Step 2 (e.g., Finance):**
        *   Coordinator retrieves the output from the Strategy task.
        *   Coordinator creates a review/addition task ("Review strategic outline, add budget considerations and financial plan section").
        *   Coordinator dispatches task to `Finance Agent`, providing the Strategy output and the current Plan Document state as input/context.
        *   `Finance Agent` processes, potentially querying its own unit documents (e.g., budget policies) or using its LLM reasoning based on its role, and updates/adds to the plan.
        *   Task Manager updates task status and stores output (the modified plan section).
    *   **Step 3 (e.g., Operations):**
        *   Coordinator retrieves the updated plan draft.
        *   Coordinator creates a task ("Review plan, add operational feasibility analysis and resource allocation section").
        *   Coordinator dispatches task to `Operations Agent` with the current plan draft.
        *   `Operations Agent` processes and updates the plan.
        *   ... and so on for subsequent units (Security, Legal).
    *   **Step N (e.g., Final Review - Administration/Lead Unit):**
        *   Coordinator retrieves the near-final plan.
        *   Coordinator creates a task ("Review the complete draft plan for consistency, clarity, and completeness. Compile the final document.").
        *   Coordinator dispatches task to the designated review agent.
        *   Agent processes and produces the final Plan Document.
3.  **Completion:**
    *   Coordinator retrieves the final Plan Document from the last task result or Shared State.
    *   Coordinator logs completion status and makes the final plan available.

## 5. Data Structures (Conceptual JSON)

```json
// Unit Representation (Derived from Unit Discovery)
{
  "id": "uuid-unit-finance",
  "name": "Finance",
  "description": "Handles budgeting, financial planning, and resource allocation.",
  "capabilities": ["budgeting", "financial_analysis", "cost_estimation"],
  "documents": [ // List of paths or references to key documents
    "units/Finance/Policies/BudgetPolicy.md",
    "units/Finance/Reports/Q1_Financials.md"
  ],
  "relationships": [
    { "targetUnitId": "uuid-unit-strategy", "type": "collaborates_with" },
    { "targetUnitId": "uuid-unit-executive", "type": "reports_to" }
  ],
  "path": "units/Finance"
}

// Agent Representation (Managed by Agent Manager)
{
  "id": "uuid-agent-finance",
  "unitId": "uuid-unit-finance",
  "name": "Finance Agent",
  "capabilities": ["budgeting", "financial_analysis"], // May mirror or subset Unit capabilities
  "memory": { // Simplified memory example
    "processedTaskIds": ["uuid-task-budget-review"],
    "keyDecisions": {}
  }
}

// Task Representation (Managed by Task Manager)
{
  "id": "uuid-task-finance-review",
  "title": "Review strategic outline, add budget considerations",
  "description": "Review the strategic outline (provided in input) and add a detailed budget section based on Finance unit policies.",
  "status": "completed", // pending, assigned, processing, completed, failed
  "assignedToUnitId": "uuid-unit-finance",
  "assignedToAgentId": "uuid-agent-finance",
  "dependsOn": ["uuid-task-strategy-draft"],
  "input": { // Context passed by Coordinator
    "previousTaskOutput": "...", // Output from Strategy Agent
    "currentPlanDraft": { ... }
  },
  "output": { // Result stored after agent processing
    "updatedPlanSection": { ... },
    "summary": "Budget section added, minor feasibility concerns noted."
  },
  "createdAt": "timestamp",
  "completedAt": "timestamp"
}

// Plan Document Representation (Managed by Shared State Manager)
{
  "title": "Implementation Plan for Project X",
  "version": 3,
  "sections": [
    {
      "title": "Strategic Outline",
      "content": "...",
      "createdBy": "uuid-unit-strategy",
      "lastUpdated": "timestamp"
    },
    {
      "title": "Budget and Financial Plan",
      "content": "...",
      "createdBy": "uuid-unit-finance",
      "lastUpdated": "timestamp"
    },
    {
      "title": "Operational Plan",
      "content": "...",
      "createdBy": "uuid-unit-operations",
      "lastUpdated": "timestamp"
    }
    // ... other sections
  ],
  "status": "in_progress" // draft, in_review, final
}

```text

## 6. Key Considerations

*   **Contextual Grounding:** Agents *must* be prompted with their Unit identity and relevant context. Simply asking an LLM to "act like Finance" is insufficient. Summaries or snippets from the unit's documents should be included in prompts or made accessible via retrieval.
*   **Workflow Definition:** The workflow sequence needs to be clearly defined, either programmatically or via a configuration file.
*   **Context Passing:** Decide precisely what information (full plan, specific sections, previous output only) is passed between steps to balance context quality with prompt size/cost.
*   **Error Handling:** Define how task failures or LLM errors are handled within the workflow (e.g., retry, assign to alternate agent, flag for human review).
*   **LLM Choice:** The choice of LLM will impact the quality of agent reasoning and output.
*   **Scalability:** Consider how the system scales with a large number of units and complex workflows.

## 7. Future Enhancements

*   **Parallel Task Execution:** Allow independent workflow branches to run concurrently where dependencies permit.
*   **Retrieval-Augmented Generation (RAG):** Enable agents to dynamically query vector stores of unit documents for more specific context during task execution.
*   **Dynamic Workflow Adjustment:** Allow the workflow to adapt based on intermediate results or agent feedback.
*   **Human-in-the-Loop:** Incorporate steps for human review, approval, or intervention.
*   **More Sophisticated Agent Memory:** Implement long-term memory and learning capabilities for agents.
*   **UI/Visualization:** Create a user interface to define workflows, monitor progress, and view results. 