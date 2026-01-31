# NoOrg Architecture Structure

## High-Level Documentation Map

This diagram illustrates the relationship between the core documentation hubs in the repository.

```mermaid
graph TD
    Root[Root Repository] --> Docs[docs/]
    Root --> Units[units/]
    Root --> Src[src/]
    
    Docs --> Frameworks[Frameworks & Standards]
    Docs --> Guides[User Guides]
    
    Units --> Governance[Governance Units]
    Units --> Operations[Operational Units]
    Units --> Innovation[Innovation Units]
    
    Src --> Core[Core Engine]
    Src --> Agents[AI Agents]
```text

## Organizational Unit Structure

The 40 Organizational Units are categorized by their primary function within the NoOrg framework.

```mermaid
classDiagram
    class Governance {
        BoardOfDirectors
        ExecutiveCommittee
        EthicsAdvisoryBoard
        RiskAdvisoryBoard
    }
    class Operations {
        Administration
        Facilities
        HumanResources
        Finance
        Legal
    }
    class Strategy {
        Executive
        Strategy
        BusinessDevelopment
        Intelligence
    }
    class Innovation {
        Research
        Development
        Innovation
        ScientificAdvisoryBoard
    }
    class Product {
        ProductManagement
        Marketing
        Sales
        CustomerSupport
    }
    class Infrastructure {
        InformationTechnology
        KnowledgeManagement
        Security
        Audit
    }
    
    Governance --> Strategy
    Strategy --> Operations
    Strategy --> Innovation
    Innovation --> Product
```text

## Agent Interaction Model

Visualizing how AI Agents interact with the Unit structure.

```mermaid
sequenceDiagram
    participant User
    participant Interface
    participant UnitAgent
    participant CoreSystem
    
    User->>Interface: Submit Request
    Interface->>CoreSystem: Route to Agent
    CoreSystem->>UnitAgent: Activate Context (e.g. Legal)
    UnitAgent->>UnitAgent: Consult policies/AGENTS.md
    UnitAgent->>CoreSystem: Request Resources
    CoreSystem->>UnitAgent: Return Data
    UnitAgent->>Interface: Response
```text
