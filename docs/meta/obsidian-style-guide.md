# Obsidian Style Guide

This guide establishes the standards for creating and maintaining documentation in our Operations Knowledge Base.

## 📝 Document Structure

### Frontmatter
Every document should begin with YAML frontmatter:
```yaml
---
title: Document Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [category1, category2]
aliases: [alternative-name]
---
```text

### Headers
- Use ATX-style headers (`#` syntax)
- Maximum of 3 header levels for most documents
- Include a space after the `#` symbols
- Capitalize first word and proper nouns

### Document Sections
1. Frontmatter
2. Title (H1)
3. Brief description/overview
4. Table of Contents (for longer documents)
5. Main content
6. Related links
7. References (if applicable)

## 🔤 Formatting Conventions

### Text Formatting
- **Bold** for emphasis and key terms
- *Italic* for secondary emphasis
- `Code` for technical terms, commands, and file paths
- ==Highlights== for critical information
- ~~Strikethrough~~ for outdated information

### Lists
- Use `-` for unordered lists
- Use `1.` for ordered lists
- Maintain consistent indentation (2 spaces)
- Maximum of 3 nesting levels

### Code Blocks
````markdown
```language
code here
```text
````

## 🔗 Linking

### Internal Links
- Use `[[target]]` for basic links
- Use `[[target|display text]]` for custom link text
- Link to specific headers with `[[note#header]]`

### External Links
- Use standard Markdown: `[text](AGENTS.md)`
- Include link titles: `[text](AGENTS.md)`

## 📁 File Organization

### Naming Conventions
- Use kebab-case for filenames
- Prefix with numbers for manual ordering (e.g., `000-home.md`)
- Be descriptive but concise
- Use lowercase letters

### File Location
- Store files in appropriate category folders
- Use sub-folders for complex topics
- Keep attachment files in `assets/`

## 🏷️ Tags

### Tag Format
- Use lowercase
- Use kebab-case for multi-word tags
- Be consistent with plural/singular forms

### Core Tags
- #process
- #policy
- #guide
- #reference
- #template
- #archived

### Status Tags
- #draft
- #review-needed
- #approved
- #deprecated

## 📊 Tables

### Table Format
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Content  | Content  |
```text

### Table Guidelines
- Include header row
- Align columns appropriately
- Keep tables simple and readable

## 🖼️ Images and Attachments

### Image Guidelines
- Store in `assets/` directory
- Use descriptive filenames
- Include alt text
- Optimize for size/quality

### Image Syntax
```markdown
![Alt text](../assets/image-name.png "Optional title")
```text

## 📋 Templates

### Template Usage
- Use appropriate template for content type
- Maintain template structure
- Customize only designated sections

### Core Templates
- Meeting notes
- Process documentation
- Policy documents
- How-to guides
- Project documentation

## 🔍 Metadata and Search

### Essential Metadata
- Title
- Creation date
- Last updated date
- Author(s)
- Status
- Tags

### Search Optimization
- Use consistent terminology
- Include relevant keywords
- Maintain clear hierarchy
- Use appropriate tags

## 📱 Mobile Compatibility

### Mobile Guidelines
- Keep paragraphs short
- Use clear headings
- Minimize table complexity
- Ensure readable image sizes

## 🔄 Version Control

### Commit Messages
- Use clear, descriptive messages
- Reference issue numbers
- Indicate type of change

### Change Documentation
- Note significant changes in frontmatter
- Update "last modified" date
- Document major revisions

## ⚡ Performance

### Optimization
- Compress images
- Limit embed depth
- Use efficient linking
- Maintain clean structure

## 📚 References

- [Obsidian Help](https://help.obsidian.md)
- [Markdown Guide](https://www.markdownguide.org)
- [Git Best Practices](https://git-scm.com/book/en/v2)

## 🤖 Agent Documentation Standards

### Agent Architecture Documentation
- Use component diagrams for agent architecture
- Document agent roles and responsibilities
- Include decision-making frameworks
- Specify communication protocols
```mermaid
graph TD
    A[Agent Core] --> B[Perception]
    A --> C[Decision Making]
    A --> D[Action Execution]
```text

### Multi-Agent System Documentation
- Define agent interaction patterns
- Document coordination mechanisms
- Specify message formats and protocols
- Include system topology diagrams

### Agent Behavior Specification
```yaml
agent:
  name: ExampleAgent
  role: TaskExecutor
  capabilities:
    - natural_language_processing
    - task_planning
    - environment_interaction
  protocols:
    - FIPA_Contract_Net
    - FIPA_Request
```text

### Agent State Documentation
- Use state diagrams for agent lifecycle
- Document state transitions
- Include error states and recovery
- Specify initialization parameters

### Agent Communication
- Document message formats
- Specify communication channels
- Include protocol sequences
```sequence
Agent A->Agent B: Request
Agent B-->Agent A: Acknowledge
Agent B->Agent A: Response
```text

### Testing and Validation
- Document test scenarios
- Include interaction test cases
- Specify performance metrics
- Document validation procedures

### Agent Tags
- #autonomous-agent
- #multi-agent-system
- #agent-behavior
- #agent-communication
- #agent-testing

### Code Documentation
```python
class Agent:
    """
    Agent class documentation should include:
    - Purpose and role
    - Required capabilities
    - Interaction patterns
    - State management
    - Error handling
    """
```text

### Performance Monitoring
- Document metrics collection
- Specify monitoring endpoints
- Include dashboard configurations
- Define alert thresholds

### Security Considerations
- Document authentication methods
- Specify access controls
- Include encryption requirements
- Define trust mechanisms

## 🔄 Agent Development Workflow

### Version Control for Agents
- Track agent versions
- Document breaking changes
- Include migration guides
- Maintain changelog

### Deployment Documentation
- Environment setup
- Dependencies management
- Configuration parameters
- Scaling guidelines

### Troubleshooting Guide
- Common issues
- Debug procedures
- Log analysis
- Recovery steps

## 🧠 Advanced Agent Cognitive Architecture

### Mental State Documentation
```yaml
cognitive_state:
  beliefs:
    format: "predicate_logic"
    storage: "belief_base"
    update_mechanism: "belief_revision"
  desires:
    priority_system: "hierarchical"
    conflict_resolution: "utility_based"
  intentions:
    commitment_strategy: "open_minded"
    reconsideration: "event_driven"
```text

### Reasoning Mechanisms
- Document inference rules
- Specify planning algorithms
- Define learning mechanisms
- Include decision criteria
```mermaid
graph LR
    A[Perception] --> B[Belief Update]
    B --> C[Goal Selection]
    C --> D[Plan Generation]
    D --> E[Action Selection]
    E --> F[Execution]
```text

### Knowledge Representation
- Ontology specifications
- Knowledge base structure
- Reasoning patterns
- Uncertainty handling

## 🤝 Inter-Agent Collaboration

### Social Protocols
- Negotiation frameworks
- Coalition formation
- Resource allocation
- Conflict resolution

### Team Formation
```yaml
team_structure:
  roles:
    - coordinator
    - specialist
    - executor
  coordination:
    mechanism: "contract_net"
    backup_strategy: "hierarchical"
  shared_mental_models:
    type: "distributed"
    synchronization: "event_based"
```text

### Collective Intelligence
- Swarm patterns
- Emergent behaviors
- Collective decision-making
- Social learning

## 🎯 Goal-Oriented Documentation

### Goal Specification
```yaml
goal:
  type: "achievement"
  success_criteria:
    - condition: "target_state_reached"
    - metrics: ["completion_time", "resource_usage"]
  failure_conditions:
    - timeout: 3600
    - resource_depletion: true
```text

### Plan Libraries
- Document reusable plans
- Specify preconditions
- Include success criteria
- Define abort conditions

## 🔍 Agent Observability

### Monitoring Patterns
```mermaid
graph TD
    A[Agent State] --> B[Metrics Collection]
    B --> C[Analysis]
    C --> D[Alerting]
    C --> E[Visualization]
```text

### Debugging Infrastructure
- Log levels and formats
- Trace mechanisms
- State inspection tools
- Performance profiling

## 🛡️ Agent Safety & Ethics

### Safety Protocols
- Operational boundaries
- Fail-safe mechanisms
- Emergency shutdown
- Recovery procedures

### Ethical Guidelines
- Decision constraints
- Value alignment
- Bias detection
- Fairness metrics

## 📊 Agent Analytics

### Performance Metrics
```yaml
metrics:
  operational:
    - response_time
    - success_rate
    - resource_efficiency
  cognitive:
    - decision_quality
    - learning_rate
    - adaptation_speed
```text

### Evaluation Framework
- Benchmark scenarios
- Comparative metrics
- Quality assessments
- Performance baselines

## 🔄 Agent Evolution

### Learning Documentation
- Learning objectives
- Training procedures
- Model updates
- Performance tracking

### Adaptation Mechanisms
```yaml
adaptation:
  triggers:
    - performance_threshold
    - environment_change
    - goal_modification
  strategies:
    - parameter_tuning
    - behavior_modification
    - knowledge_update
```text

## 🏗️ Agent Design Patterns

### Architectural Patterns
- Layered architecture
- Subsumption architecture
- Hybrid architectures
- Microservices patterns

### Interaction Patterns
```mermaid
graph LR
    A[Publisher] --> B[Message Broker]
    B --> C[Subscriber 1]
    B --> D[Subscriber 2]
```text

## 📈 Scalability Documentation

### Scaling Patterns
- Horizontal scaling
- Load balancing
- Resource allocation
- Performance optimization

### Distribution Mechanisms
```yaml
distribution:
  strategy: "federated"
  synchronization: "eventual"
  communication: "async"
  recovery: "checkpoint_based"
```text

## 🔗 Integration Standards

### API Documentation
```yaml
api:
  version: "1.0"
  endpoints:
    - path: "/agent/status"
      methods: ["GET", "POST"]
      auth: "required"
  schemas:
    - name: "AgentState"
      format: "JSON"
```text

### Interface Specifications
- Command formats
- Response structures
- Error handling
- Version compatibility

## 📑 Advanced Obsidian Organization

### Agent Knowledge Base Structure
```text
agents/
├── architectures/
│   ├── cognitive-models.md
│   ├── decision-frameworks.md
│   └── perception-systems.md
├── behaviors/
│   ├── learning-patterns.md
│   ├── reasoning-models.md
│   └── action-patterns.md
├── communication/
│   ├── protocols.md
│   ├── message-formats.md
│   └── interaction-patterns.md
└── _templates/
    ├── agent-spec.md
    ├── behavior-doc.md
    └── protocol-doc.md
```text

### Linking Patterns

#### Basic Links
- Direct link: `[[agent-architecture]]`
- Aliased link: `[[agent-architecture|Agent Architectural Pattern]]`
- Header link: `[[agent-architecture#cognitive-model]]`
- Block link: `[[agent-architecture#^block-id]]`

#### Advanced Linking
```markdown
<!-- Embedded content -->
![[agent-architecture#diagram]]

<!-- Multi-file reference -->
[[agent-architecture]] + [[behavior-patterns]]

<!-- Transclusion with parameters -->
![[_templates/agent-spec.md:yaml]]
```text

### Backlink Usage
- Use consistent terminology for bidirectional linking
- Create hub pages for key concepts
- Maintain relationship context
```markdown
<!-- In cognitive-models.md -->
Related: [[reasoning-models|Reasoning]], [[learning-patterns|Learning]]

<!-- In reasoning-models.md -->
Part of: [[cognitive-models|Cognitive Architecture]]
```text

### Dynamic Views
```markdown
<!-- Agent List View -->
```dataview
TABLE
  role as "Role",
  capabilities as "Capabilities"
FROM "agents"
WHERE type = "agent"
SORT role ASC
```text

<!-- Behavior Tracking -->
```dataview
LIST
FROM #agent-behavior
GROUP BY category
```text

### Metadata Standards
```yaml
---
type: agent-spec
status: active
created: 2024-03-21
updated: 2024-03-21
tags:
  - agent
  - cognitive
  - architecture
aliases:
  - Agent Specification
  - Agent Design
relationships:
  implements:
    - [[cognitive-models]]
    - [[behavior-patterns]]
  uses:
    - [[communication-protocols]]
  depends-on:
    - [[resource-management]]
---
```text

## 🗂️ File Organization

### Agent Documentation Files
```yaml
standard_files:
  specification:
    - agent-spec.md
    - capabilities.md
    - requirements.md
  implementation:
    - architecture.md
    - components.md
    - interfaces.md
  deployment:
    - setup.md
    - configuration.md
    - monitoring.md
```text

### Naming Conventions
```yaml
file_naming:
  pattern: "<category>-<type>-<name>.md"
  examples:
    - "agent-spec-taskexecutor.md"
    - "behavior-pattern-learning.md"
    - "protocol-definition-fipa.md"
```text

### Cross-Reference System
```mermaid
graph TD
    A[Agent Spec] --> B[Capabilities]
    A --> C[Behaviors]
    B --> D[Requirements]
    C --> E[Protocols]
    
    style A fill:#f9f,stroke:#333
    style B fill:#bbf,stroke:#333
    style C fill:#bbf,stroke:#333
```text

## 🔍 Advanced Search Patterns

### Query Examples
```dataview
TABLE
  file.mtime as "Last Modified",
  status as "Status",
  priority as "Priority"
FROM "agents"
WHERE contains(tags, "active")
SORT file.mtime DESC
```text

### Tag Hierarchy
```yaml
tag_structure:
  agent:
    - cognitive
    - behavioral
    - communicative
  architecture:
    - monolithic
    - distributed
    - hybrid
  status:
    - draft
    - review
    - active
    - deprecated
```text

## 📋 Template System

### Agent Template
```yaml
---
type: agent-template
version: 1.0
---

# Agent: {{name}}

## Overview
- Purpose: {{purpose}}
- Category: {{category}}
- Status: {{status}}

## Specifications
- Architecture: [[agent-architectures#{{architecture}}]]
- Behaviors: [[behavior-patterns#{{behaviors}}]]
- Protocols: [[communication-protocols#{{protocols}}]]

## Implementation
- Core Components: {{components}}
- Dependencies: {{dependencies}}
- Configuration: {{config}}

## Related
- [[agent-list|Agent Registry]]
- [[behavior-catalog|Behavior Patterns]]
- [[protocol-standards|Communication Standards]]
```text

### Behavior Template
```yaml
---
type: behavior-template
version: 1.0
---

# Behavior: {{name}}

## Pattern
- Type: {{type}}
- Trigger: {{trigger}}
- Response: {{response}}

## Implementation
- Algorithm: [[algorithms#{{algorithm}}]]
- Parameters: {{parameters}}
- Constraints: {{constraints}}

## Integration
- Required Capabilities: {{capabilities}}
- Dependencies: {{dependencies}}
```text

---

*Last updated: [Current Date]* 