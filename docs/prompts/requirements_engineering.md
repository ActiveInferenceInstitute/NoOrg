# Requirements Engineering and Management

## Core Principles
- **Stakeholder centricity**: Center all requirements activities around stakeholder needs
- **Progressive elaboration**: Refine requirements iteratively, from high-level to detailed
- **Traceability**: Maintain clear links between requirements and their sources/implementations
- **Validation focus**: Continuously verify requirements meet actual stakeholder needs
- **Clear communication**: Express requirements in language accessible to all stakeholders
- **Change management**: Handle requirement changes systematically and transparently

```mermaid
mindmap
  root((Requirements Engineering))
    Stakeholder Centricity
      Needs identification
      Value elicitation
      Perspective balancing
      Continuous engagement
    Progressive Elaboration
      Iterative refinement
      Detail appropriate to phase
      High-level to specific
      Continuous validation
    Traceability
      Source linkage
      Implementation mapping
      Impact analysis
      Change tracking
    Validation Focus
      Reality checks
      Consistency verification
      Feasibility assessment
      Acceptance criteria
    Clear Communication
      Accessible language
      Unambiguous specification
      Visual modeling
      Shared understanding
    Change Management
      Systematic processes
      Impact assessment
      Version control
      Approval workflows
```text

## Requirements Elicitation Techniques
1. **Interviews and workshops**
   - Conduct one-on-one structured interviews with key stakeholders
   - Facilitate collaborative requirements workshops
   - Use active listening and open-ended questioning
   - Document both explicit and implicit needs
   - Apply techniques like brainstorming and affinity diagrams

2. **Observation and contextual inquiry**
   - Observe users in their natural environment
   - Shadow key users performing their activities
   - Document workflows, pain points, and workarounds
   - Identify unstated needs and constraints
   - Analyze environmental and contextual factors

3. **Surveys and questionnaires**
   - Design targeted questions for broad stakeholder input
   - Use a mix of closed and open-ended questions
   - Apply quantitative and qualitative analysis
   - Identify patterns and trends across responses
   - Follow up on significant findings with deeper techniques

4. **Document analysis**
   - Review existing system documentation
   - Analyze business rules and policy documents
   - Examine process documentation and workflows
   - Study competitor features and industry standards
   - Identify constraints from legal and regulatory documents

```mermaid
graph TD
    A[Requirements Elicitation] --> B[Interviews & Workshops]
    A --> C[Observation & Contextual Inquiry]
    A --> D[Surveys & Questionnaires]
    A --> E[Document Analysis]
    
    B --> B1[Structured interviews]
    B --> B2[Group workshops]
    B --> B3[Active listening]
    B --> B4[Implicit need identification]
    B --> B5[Collaborative techniques]
    
    C --> C1[User observation]
    C --> C2[Workflow shadowing]
    C --> C3[Pain point documentation]
    C --> C4[Unstated need discovery]
    C --> C5[Contextual analysis]
    
    D --> D1[Targeted questions]
    D --> D2[Question type mixing]
    D --> D3[Response analysis]
    D --> D4[Pattern identification]
    D --> D5[Finding follow-up]
    
    E --> E1[System documentation review]
    E --> E2[Business rule analysis]
    E --> E3[Process examination]
    E --> E4[Competitor study]
    E --> E5[Constraint identification]
    
    B --> F[Comprehensive Requirements]
    C --> F
    D --> F
    E --> F
```text

## Requirements Analysis and Specification
1. **Requirements classification**
   - Distinguish functional from non-functional requirements
   - Categorize by domain, priority, stability, and risk
   - Identify constraints vs. preferences
   - Separate user/system/business requirements
   - Recognize regulatory and compliance requirements

2. **Requirements modeling**
   - Create visual models to represent requirements
   - Develop user stories, use cases, or scenarios
   - Model system behavior with diagrams
   - Depict data structures and relationships
   - Illustrate workflows and processes

3. **Requirements documentation**
   - Create structured requirements specifications
   - Apply consistent templates and formats
   - Use clear, unambiguous language
   - Include acceptance criteria for each requirement
   - Provide appropriate level of detail

4. **Requirements validation**
   - Review requirements with stakeholders
   - Perform walkthroughs and inspections
   - Check for completeness, consistency, and feasibility
   - Validate against business goals and objectives
   - Test requirements with prototypes

```mermaid
flowchart TD
    A[Requirements Analysis] --> B[Requirements Classification]
    A --> C[Requirements Modeling]
    A --> D[Requirements Documentation]
    A --> E[Requirements Validation]
    
    B --> B1[Functional/non-functional]
    B --> B2[Category organization]
    B --> B3[Constraint identification]
    B --> B4[Requirement type separation]
    B --> B5[Compliance recognition]
    
    C --> C1[Visual representation]
    C --> C2[User story/use case creation]
    C --> C3[Behavior modeling]
    C --> C4[Data structure depiction]
    C --> C5[Process illustration]
    
    D --> D1[Structured specifications]
    D --> D2[Template application]
    D --> D3[Clear language]
    D --> D4[Acceptance criteria inclusion]
    D --> D5[Detail appropriateness]
    
    E --> E1[Stakeholder review]
    E --> E2[Inspection performance]
    E --> E3[Quality checking]
    E --> E4[Goal validation]
    E --> E5[Prototype testing]
    
    B --> F[Quality Requirements]
    C --> F
    D --> F
    E --> F
```text

## Requirements Management
1. **Prioritization**
   - Apply systematic prioritization techniques (MoSCoW, etc.)
   - Balance business value with implementation cost
   - Consider dependencies between requirements
   - Account for stakeholder needs and preferences
   - Align with strategic objectives and constraints

2. **Traceability**
   - Maintain bidirectional traceability
   - Link requirements to their sources
   - Connect requirements to design and implementation
   - Track test cases back to requirements
   - Enable impact analysis for changes

3. **Change control**
   - Establish formal change request process
   - Assess impact of proposed changes
   - Obtain appropriate approvals
   - Update related documentation
   - Communicate changes to stakeholders

4. **Version control**
   - Maintain requirement baselines
   - Track requirement history and evolution
   - Support concurrent requirement development
   - Enable comparison between versions
   - Ensure requirements integrity

```mermaid
graph TD
    A[Requirements Management] --> B[Prioritization]
    A --> C[Traceability]
    A --> D[Change Control]
    A --> E[Version Control]
    
    B --> B1[Systematic techniques]
    B --> B2[Value-cost balance]
    B --> B3[Dependency consideration]
    B --> B4[Stakeholder accounting]
    B --> B5[Strategic alignment]
    
    C --> C1[Bidirectional maintenance]
    C --> C2[Source linking]
    C --> C3[Implementation connection]
    C --> C4[Test case tracking]
    C --> C5[Impact analysis enablement]
    
    D --> D1[Formal process]
    D --> D2[Impact assessment]
    D --> D3[Approval obtaining]
    D --> D4[Documentation updating]
    D --> D5[Change communication]
    
    E --> E1[Baseline maintenance]
    E --> E2[History tracking]
    E --> E3[Concurrent development]
    E --> E4[Version comparison]
    E --> E5[Integrity assurance]
    
    B --> F[Managed Requirements]
    C --> F
    D --> F
    E --> F
```text

## Requirements Tools and Techniques
1. **User stories and acceptance criteria**
   - Structure as "As a [role], I want [feature], so that [benefit]"
   - Add specific, testable acceptance criteria
   - Focus on user value and outcomes
   - Balance detail with flexibility
   - Maintain appropriate granularity

2. **Use cases and scenarios**
   - Define actors, preconditions, flows, and postconditions
   - Include main success scenario and alternate flows
   - Add exception handling and error cases
   - Document business rules and constraints
   - Validate with stakeholders

3. **Prototyping**
   - Create low-fidelity wireframes for quick feedback
   - Develop interactive prototypes for usability validation
   - Evolve prototype detail with requirement maturity
   - Focus on areas of uncertainty or risk
   - Use as communication tool with stakeholders

4. **Requirements tools**
   - Select appropriate requirements management tools
   - Configure for traceability and change management
   - Ensure accessibility for all stakeholders
   - Integrate with development and testing tools
   - Balance tool sophistication with usability

```mermaid
flowchart LR
    A[Requirements Tools & Techniques] --> B[User Stories]
    A --> C[Use Cases]
    A --> D[Prototyping]
    A --> E[Requirements Tools]
    
    B --> B1[Role-feature-benefit structure]
    B --> B2[Acceptance criteria]
    B --> B3[Value focus]
    B --> B4[Detail-flexibility balance]
    B --> B5[Appropriate granularity]
    
    C --> C1[Component definition]
    C --> C2[Flow documentation]
    C --> C3[Exception handling]
    C --> C4[Business rule inclusion]
    C --> C5[Stakeholder validation]
    
    D --> D1[Low-fidelity wireframes]
    D --> D2[Interactive development]
    D --> D3[Detail evolution]
    D --> D4[Risk area focus]
    D --> D5[Communication utilization]
    
    E --> E1[Tool selection]
    E --> E2[Traceability configuration]
    E --> E3[Stakeholder accessibility]
    E --> E4[Tool integration]
    E --> E5[Usability balance]
    
    B --> F[Effective Requirements Engineering]
    C --> F
    D --> F
    E --> F
```text

## Special Requirement Considerations
1. **Non-functional requirements**
   - Specify measurable quality attributes
   - Address performance, security, usability, reliability
   - Include compliance and regulatory requirements
   - Define operational and environmental constraints
   - Specify technical constraints and standards

2. **Agile requirements**
   - Maintain a prioritized product backlog
   - Progressively elaborate through iterations
   - Use just-in-time detailing of requirements
   - Collaborate closely with stakeholders
   - Embrace change through adaptation

3. **Large-scale requirements**
   - Apply hierarchical requirements structures
   - Manage requirements at different abstraction levels
   - Handle requirements dependencies effectively
   - Coordinate across multiple teams
   - Ensure consistency across subsystems

4. **Legacy system requirements**
   - Analyze existing functionality and constraints
   - Reverse-engineer missing requirements
   - Identify improvement opportunities
   - Balance maintaining compatibility with innovation
   - Document implicit assumptions and dependencies

```mermaid
graph TD
    A[Special Requirement Considerations] --> B[Non-Functional Requirements]
    A --> C[Agile Requirements]
    A --> D[Large-Scale Requirements]
    A --> E[Legacy System Requirements]
    
    B --> B1[Quality attribute specification]
    B --> B2[Critical aspect addressing]
    B --> B3[Compliance inclusion]
    B --> B4[Constraint definition]
    B --> B5[Standard specification]
    
    C --> C1[Backlog maintenance]
    C --> C2[Progressive elaboration]
    C --> C3[Just-in-time detailing]
    C --> C4[Stakeholder collaboration]
    C --> C5[Change embracing]
    
    D --> D1[Hierarchical structuring]
    D --> D2[Abstraction level management]
    D --> D3[Dependency handling]
    D --> D4[Team coordination]
    D --> D5[Consistency assurance]
    
    E --> E1[Functionality analysis]
    E --> E2[Requirement reverse-engineering]
    E --> E3[Opportunity identification]
    E --> E4[Compatibility-innovation balance]
    E --> E5[Assumption documentation]
    
    B --> F[Comprehensive Requirements Strategy]
    C --> F
    D --> F
    E --> F
```text

## Requirements Challenges and Solutions
- **Volatile requirements**: Implement change management and prioritization
- **Incomplete requirements**: Apply iterative elicitation and validation
- **Conflicting stakeholder needs**: Facilitate negotiation and trade-off analysis
- **Ambiguous requirements**: Use models, prototypes, and acceptance criteria
- **Over-specified requirements**: Focus on what, not how; separate requirements from design
- **Under-specified requirements**: Establish clear acceptance criteria and definitions of done

```mermaid
mindmap
  root((Requirements Challenges))
    Volatile Requirements
      Change management process
      Impact analysis
      Prioritization techniques
      Baseline management
    Incomplete Requirements
      Iterative elicitation
      Stakeholder validation
      Gap analysis
      Progressive refinement
    Conflicting Stakeholder Needs
      Facilitated negotiation
      Trade-off analysis
      Compromise strategies
      Value-based prioritization
    Ambiguous Requirements
      Model visualization
      Prototyping
      Specific acceptance criteria
      Glossary and definitions
    Over-specified Requirements
      What vs. how separation
      Requirements vs. design
      Appropriate abstraction
      Focus on outcomes
    Under-specified Requirements
      Acceptance criteria
      Definition of done
      Testability verification
      Example scenarios
```text

## Requirements Engineering Process Model
```mermaid
graph TB
    A[Stakeholder Identification] --> B[Requirements Elicitation]
    B --> C[Requirements Analysis]
    C --> D[Requirements Specification]
    D --> E[Requirements Validation]
    E --> F{Valid & Complete?}
    F -->|No| G[Refine Requirements]
    G --> B
    F -->|Yes| H[Requirements Baseline]
    H --> I[Implementation Planning]
    I --> J[Ongoing Requirements Management]
    J --> K{Change Requested?}
    K -->|Yes| L[Change Analysis]
    L --> M[Impact Assessment]
    M --> N{Approve Change?}
    N -->|Yes| O[Update Requirements]
    O --> H
    N -->|No| J
    K -->|No| J
    
    subgraph "Continuous Activities"
    P[Stakeholder Communication]
    Q[Traceability Maintenance]
    R[Requirements Repository Management]
    end
    
    P -.-> B
    P -.-> E
    P -.-> L
    
    Q -.-> D
    Q -.-> O
    
    R -.-> H
    R -.-> J
```text 