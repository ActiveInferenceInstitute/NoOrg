# Advisory Board Reporting Structure

## Overview

This directory documents the formal reporting relationships, information flows, and organizational interfaces between the Advisory Board and other organizational entities. These reporting structures ensure effective communication, governance, and advisory impact.

```mermaid
graph TD
    AB[Advisory Board] -->|Reports To| BOD[Board of Directors]
    AB -->|Strategic Guidance| EC[Executive Committee]
    AB -->|Advisory Input| OU[Organizational Units]
    
    Committees -->|Report To| AB
    WorkingGroups -->|Report To| AB
    
    subgraph AdvisoryEntities [Advisory Entities]
        Committees[Board Committees]
        WorkingGroups[Working Groups]
    end
    
    subgraph OrganizationalEntities [Organizational Entities]
        BOD
        EC
        OU
    end
    
    class AdvisoryEntities,OrganizationalEntities boundary;
```text

## Reporting Relationships

### Board Governance Reporting
- [[BoardGovernanceReporting|Board Governance Reporting]]
- Documents the formal reporting relationship between the Advisory Board and the Board of Directors
- Includes governance oversight, charter compliance, and performance reporting

### Executive Reporting
- [[ExecutiveReporting|Executive Reporting]]
- Outlines reporting to the Executive Committee and organizational leadership
- Focuses on strategic advisory input, recommendations, and expertise sharing

### Unit Interface Reporting
- [[UnitInterfaceReporting|Unit Interface Reporting]]
- Describes coordination and information exchange with organizational units
- Includes advisory support, specialized expertise, and collaborative activities

## Information Flows

### Advisory Outputs
- [[AdvisoryOutputs|Advisory Output Distribution]]
- Documents the flow of formal recommendations, reports, and advisory documents
- Includes distribution protocols, feedback mechanisms, and impact tracking

### Information Inputs
- [[InformationInputs|Information Input Sources]]
- Maps sources of information provided to the Advisory Board
- Includes organizational data, strategic plans, performance metrics, and external intelligence

### Knowledge Exchange
- [[KnowledgeExchange|Knowledge Exchange Framework]]
- Outlines protocols for two-way knowledge sharing
- Includes expertise sharing, best practices, and continuous learning

## Communication Cadence

- [[CommunicationSchedule|Communication Schedule]]
- Documents frequency and timing of regular reporting activities
- Aligns with organizational planning and decision cycles

## Organizational Chart

- [[OrganizationalRelationships|Organizational Relationships Diagram]]
- Visual representation of Advisory Board position in overall organization
- Shows formal and informal reporting lines and relationships

## Related Documents

- [[../Charter|Advisory Board Charter]]
- [[../Policies/ReportingRequirements|Reporting Requirements Policy]]
- [[../Processes/AdvisoryReportingProcess|Advisory Reporting Process]]
- [[../Reports/README|Advisory Reports Overview]] 