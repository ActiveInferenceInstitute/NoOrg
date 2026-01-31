# Code Analysis and Modification

## Core Principles
- **Progressive understanding**: Build knowledge of code in layers, from high-level structure to implementation details
- **Documentation-first**: Document understanding and planned changes before making modifications
- **Bounded confidence**: Explicitly identify certainty levels about code understanding and proposed changes
- **Minimal intervention**: Make the smallest change necessary to achieve the objective
- **Change isolation**: Contain modifications to clearly defined, limited areas of the codebase
- **Traceability**: Maintain clear links between requirements, code changes, and test validations

```mermaid
mindmap
  root((Code Analysis & Modification))
    Progressive Understanding
      Architectural overview
      Component relationships
      Module responsibilities
      Implementation patterns
      Detailed logic
    Documentation-First
      Understanding capture
      Change planning
      Decision recording
      Assumption documentation
      Reference linking
    Bounded Confidence
      Certainty assessment
      Knowledge gaps identification
      Assumption tracking
      Verification needs
      Alternative explanations
    Minimal Intervention
      Targeted changes
      Side-effect limitation
      Simplicity prioritization
      Incremental approach
      Existing pattern adherence
    Change Isolation
      Scope definition
      Dependency mapping
      Interface preservation
      Contract maintenance
      Component boundaries
    Traceability
      Requirement mapping
      Change rationale
      Implementation links
      Test coverage
      Review tracking
```text

## Code Analysis Methodology
1. **Context establishment**
   - Identify the purpose and scope of analysis
   - Clarify the specific questions or issues to address
   - Determine relevant subsystems and components
   - Understand constraints and requirements
   - Define success criteria for the analysis

2. **Structural analysis**
   - Map high-level system architecture
   - Identify key components and their relationships
   - Trace data and control flow
   - Recognize design patterns and idioms
   - Document system boundaries and interfaces

3. **Behavioral analysis**
   - Trace execution paths for key scenarios
   - Identify conditional logic and decision points
   - Map error handling and exception paths
   - Understand state management and transitions
   - Document timing, concurrency, and async patterns

4. **Dependency analysis**
   - Identify external library and framework usage
   - Map internal dependencies between components
   - Recognize critical coupling points
   - Identify potential cross-cutting concerns
   - Document build and deployment dependencies

```mermaid
graph TD
    A[Code Analysis] --> B[Context Establishment]
    A --> C[Structural Analysis]
    A --> D[Behavioral Analysis]
    A --> E[Dependency Analysis]
    
    B --> B1[Purpose identification]
    B --> B2[Question clarification]
    B --> B3[Subsystem determination]
    B --> B4[Constraint understanding]
    B --> B5[Success criteria definition]
    
    C --> C1[Architecture mapping]
    C --> C2[Component identification]
    C --> C3[Flow tracing]
    C --> C4[Pattern recognition]
    C --> C5[Boundary documentation]
    
    D --> D1[Path tracing]
    D --> D2[Logic identification]
    D --> D3[Error mapping]
    D --> D4[State understanding]
    D --> D5[Timing documentation]
    
    E --> E1[External identification]
    E --> E2[Internal mapping]
    E --> E3[Coupling recognition]
    E --> E4[Concern identification]
    E --> E5[Build dependency documentation]
    
    B --> F[Comprehensive Code Understanding]
    C --> F
    D --> F
    E --> F
```text

## Modification Planning Framework
1. **Change specification**
   - Define precise objectives of the change
   - Establish acceptance criteria
   - Identify minimum scope necessary
   - Document expected behavior before and after
   - Clarify assumptions and constraints

2. **Impact assessment**
   - Identify all affected components
   - Map ripple effects through dependencies
   - Assess potential side effects
   - Evaluate performance implications
   - Consider security and maintainability impacts

3. **Implementation strategy**
   - Determine approach for making changes
   - Plan sequence of modifications
   - Identify refactoring opportunities
   - Define testing strategy for changes
   - Establish rollback approach if needed

4. **Risk assessment**
   - Identify potential failure modes
   - Assess likelihood and impact of each risk
   - Establish mitigation strategies
   - Define verification points
   - Plan contingencies for high-risk changes

```mermaid
flowchart TD
    A[Modification Planning] --> B[Change Specification]
    A --> C[Impact Assessment]
    A --> D[Implementation Strategy]
    A --> E[Risk Assessment]
    
    B --> B1[Objective definition]
    B --> B2[Criteria establishment]
    B --> B3[Scope identification]
    B --> B4[Behavior documentation]
    B --> B5[Assumption clarification]
    
    C --> C1[Component identification]
    C --> C2[Ripple mapping]
    C --> C3[Side effect assessment]
    C --> C4[Performance evaluation]
    C --> C5[Security consideration]
    
    D --> D1[Approach determination]
    D --> D2[Sequence planning]
    D --> D3[Refactoring identification]
    D --> D4[Testing strategy]
    D --> D5[Rollback establishment]
    
    E --> E1[Failure identification]
    E --> E2[Risk assessment]
    E --> E3[Mitigation strategies]
    E --> E4[Verification points]
    E --> E5[Contingency planning]
    
    B --> F[Well-Planned Modification]
    C --> F
    D --> F
    E --> F
```text

## Code Documentation Practices
1. **Understanding documentation**
   - Record system structure and behavior
   - Document design patterns and architectural decisions
   - Map non-obvious relationships and dependencies
   - Note performance characteristics and constraints
   - Capture domain-specific logic and requirements

2. **Change documentation**
   - Record motivation and rationale for changes
   - Document alternatives considered and rejected
   - Specify expected outcomes and verification methods
   - Note potential future impacts or technical debt
   - Include references to requirements or issues

3. **Uncertainty documentation**
   - Explicitly identify knowledge gaps
   - Document assumptions made during analysis
   - Rate confidence levels for different aspects
   - Highlight areas needing verification
   - Note alternative interpretations of code

4. **Meta-documentation**
   - Record analysis process and methods
   - Document tools and techniques used
   - Note challenges encountered during analysis
   - List reference materials consulted
   - Include contact information for domain experts

```mermaid
graph TD
    A[Documentation Practices] --> B[Understanding Documentation]
    A --> C[Change Documentation]
    A --> D[Uncertainty Documentation]
    A --> E[Meta-Documentation]
    
    B --> B1[Structure recording]
    B --> B2[Design documentation]
    B --> B3[Relationship mapping]
    B --> B4[Performance notation]
    B --> B5[Domain logic capture]
    
    C --> C1[Motivation recording]
    C --> C2[Alternative documentation]
    C --> C3[Outcome specification]
    C --> C4[Impact notation]
    C --> C5[Reference inclusion]
    
    D --> D1[Gap identification]
    D --> D2[Assumption documentation]
    D --> D3[Confidence rating]
    D --> D4[Verification highlighting]
    D --> D5[Interpretation notation]
    
    E --> E1[Process recording]
    E --> E2[Tool documentation]
    E --> E3[Challenge notation]
    E --> E4[Reference listing]
    E --> E5[Contact inclusion]
    
    B --> F[Comprehensive Documentation]
    C --> F
    D --> F
    E --> F
```text

## Uncertainty Handling and Escalation
1. **Uncertainty classification**
   - Categorize types of uncertainty (functional, structural, etc.)
   - Assess impact of uncertainty on proposed changes
   - Differentiate between verifiable and inherent uncertainties
   - Identify critical vs. non-critical uncertainties
   - Document confidence levels with explicit reasoning

2. **Verification approaches**
   - Define strategies to resolve key uncertainties
   - Utilize tests, logs, and debugging for verification
   - Consult documentation and code comments
   - Use controlled experiments for behavioral validation
   - Reference version history and commit messages

3. **Escalation protocol**
   - Establish thresholds for escalation based on uncertainty level
   - Define formal process for escalating decisions
   - Prepare clear documentation of issues requiring judgment
   - Present options with pros/cons for human decision-makers
   - Include sufficient context for informed decision-making

4. **Conservative action under uncertainty**
   - Implement changes with minimal speculation
   - Favor explicit over implicit behavior
   - Add defensive coding for unverified assumptions
   - Include detailed comments explaining uncertainty
   - Implement telemetry to validate behavior in production

```mermaid
flowchart LR
    A[Uncertainty Handling] --> B[Uncertainty Classification]
    A --> C[Verification Approaches]
    A --> D[Escalation Protocol]
    A --> E[Conservative Action]
    
    B --> B1[Type categorization]
    B --> B2[Impact assessment]
    B --> B3[Uncertainty differentiation]
    B --> B4[Criticality identification]
    B --> B5[Confidence documentation]
    
    C --> C1[Strategy definition]
    C --> C2[Tool utilization]
    C --> C3[Documentation consultation]
    C --> C4[Experiment use]
    C --> C5[History reference]
    
    D --> D1[Threshold establishment]
    D --> D2[Process definition]
    D --> D3[Issue documentation]
    D --> D4[Option presentation]
    D --> D5[Context inclusion]
    
    E --> E1[Minimal speculation]
    E --> E2[Explicit behavior]
    E --> E3[Defensive coding]
    E --> E4[Comment inclusion]
    E --> E5[Telemetry implementation]
    
    B --> F[Responsible Handling of Uncertainty]
    C --> F
    D --> F
    E --> F
```text

## Code Modification Techniques
1. **Incremental change patterns**
   - Implement changes in small, testable increments
   - Apply parallel implementation techniques for validation
   - Use feature flags for controlled deployment
   - Implement reversible changes where possible
   - Maintain backward compatibility during transition

2. **Pattern-preserving modification**
   - Identify and maintain existing code patterns
   - Follow established conventions in the codebase
   - Preserve architectural boundaries and structure
   - Maintain consistent abstraction levels
   - Respect existing naming conventions and styles

3. **Refactoring for change**
   - Apply preparatory refactoring to simplify changes
   - Extract methods or components to isolate changes
   - Improve test coverage before modifications
   - Simplify complex code paths before changing
   - Apply design patterns to make code more flexible

4. **Test-driven modification**
   - Write tests to capture current behavior
   - Define tests for expected new behavior
   - Implement minimum code to pass tests
   - Use test coverage to verify completeness
   - Employ mutation testing for critical changes

```mermaid
graph TD
    A[Modification Techniques] --> B[Incremental Change Patterns]
    A --> C[Pattern-Preserving Modification]
    A --> D[Refactoring for Change]
    A --> E[Test-Driven Modification]
    
    B --> B1[Small increments]
    B --> B2[Parallel implementation]
    B --> B3[Feature flags]
    B --> B4[Reversible changes]
    B --> B5[Backward compatibility]
    
    C --> C1[Pattern identification]
    C --> C2[Convention following]
    C --> C3[Boundary preservation]
    C --> C4[Abstraction maintenance]
    C --> C5[Naming consistency]
    
    D --> D1[Preparatory refactoring]
    D --> D2[Method extraction]
    D --> D3[Test improvement]
    D --> D4[Path simplification]
    D --> D5[Pattern application]
    
    E --> E1[Current behavior tests]
    E --> E2[New behavior tests]
    E --> E3[Minimal implementation]
    E --> E4[Coverage verification]
    E --> E5[Mutation testing]
    
    B --> F[Effective Code Modification]
    C --> F
    D --> F
    E --> F
```text

## Decision-Making Framework for Code Changes
- **When to make changes directly**: Clear requirements, high confidence in understanding, low complexity, good test coverage
- **When to refactor first**: High complexity, poor structure, low test coverage, repeated patterns
- **When to rewrite**: Fundamental design issues, excessive technical debt, incompatible requirements
- **When to escalate**: Unclear requirements, critical system components, security implications, architectural changes
- **When to recommend alternatives**: Requirements can be met more simply, better solutions exist, fundamental limitations

```mermaid
mindmap
  root((Change Decision))
    Direct Change
      Clear requirements
      High confidence
      Low complexity
      Good test coverage
      Limited scope
    Refactor First
      High complexity
      Poor structure
      Low test coverage
      Repeated patterns
      Implementation debt
    Rewrite
      Fundamental design issues
      Excessive technical debt
      Incompatible requirements
      Unsupported technologies
      Prohibitive maintenance
    Escalate
      Unclear requirements
      Critical components
      Security implications
      Architectural impacts
      Significant risk
    Recommend Alternatives
      Simpler solutions
      Better approaches
      Fundamental limitations
      Technical constraints
      Resource considerations
```text

## Code Analysis and Modification Process Model
```mermaid
graph TB
    A[Requirement/Issue Analysis] --> B[System Context Understanding]
    B --> C[Focused Code Analysis]
    C --> D[Understanding Documentation]
    D --> E[Change Planning]
    E --> F[Impact Assessment]
    F --> G[Uncertainty Evaluation]
    G --> H{High Uncertainty?}
    H -->|Yes| I[Escalation]
    I --> J[Human Decision]
    J --> K[Refined Plan]
    H -->|No| K
    K --> L[Test Development]
    L --> M[Implementation]
    M --> N[Verification]
    N --> O{Verification Successful?}
    O -->|No| P[Issue Investigation]
    P --> E
    O -->|Yes| Q[Documentation Update]
    Q --> R[Review Preparation]
    R --> S[Final Validation]
    
    subgraph "Continuous Activities"
    T[Knowledge Building]
    U[Confidence Assessment]
    V[Alternative Consideration]
    end
    
    T -.-> B
    T -.-> C
    T -.-> E
    
    U -.-> D
    U -.-> G
    U -.-> N
    
    V -.-> E
    V -.-> K
    V -.-> P
```text 