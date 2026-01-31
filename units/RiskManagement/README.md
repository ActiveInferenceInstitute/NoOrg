# Risk Management Unit

## Overview

The Risk Management Unit is responsible for identifying, assessing, mitigating, and monitoring risks across the organization. It establishes a systematic approach to risk management that protects organizational value while enabling strategic growth and operational resilience.

```mermaid
graph TD
    subgraph RiskManagementUnit [Risk Management Unit]
        direction LR
        Charter[[Charter]]
        Policies[[Policies]]
        Processes[[Processes]]
        Reports[[Reports]]
        Meetings[[Meeting Notes]]
    end

    subgraph KeyFunctions [Key Functions]
        direction LR
        RiskIdentification[Risk Identification]
        RiskAssessment[Risk Assessment]
        RiskMitigation[Risk Mitigation]
        RiskMonitoring[Risk Monitoring]
        Compliance[Compliance]
        BCP[Business Continuity]
    end

    RiskManagementUnit --> KeyFunctions
    Charter --> RiskManagementUnit
    Policies --> RiskManagementUnit
    Processes --> RiskManagementUnit
    Reports --> RiskManagementUnit
    Meetings --> RiskManagementUnit
```text

## Key Documents

- **Charter**: [[Charter]] - Defines the unit's purpose, scope, objectives, governance, and structure.
- **Policies**: [[Policies/README|Policies Overview]] - Governs how the unit operates, including:
    - [[Policies/riskmanagementunit|Unit Overview & Interfaces]]
    - [[Policies/PositionsPersonas|Positions & Personas]]
    - [[Policies/RiskAppetite|Risk Appetite]]
    - [[Policies/Responsibilities|Roles & Responsibilities]]
    - [[Policies/SkillsRoles|Skills & Roles]]
- **Processes**: [[Processes/README|Processes Overview]] - Describes core risk management workflows, such as:
    - [[Processes/RiskIdentification|Risk Identification]]
    - [[Processes/RiskAssessment|Risk Assessment]]
    - [[Processes/RiskMitigation|Risk Mitigation]]
    - [[Processes/RiskMonitoring|Risk Monitoring]]
    - [[Processes/BusinessContinuity|Business Continuity Planning]]
- **Meeting Notes**: [[MeetingNotes/README|Meeting Notes]] - Records of discussions, decisions, and action items.
- **Reports**: [[Reports/README|Reports]] - Risk summaries, analyses, and dashboards.

## Purpose

To protect organizational value by identifying, assessing, mitigating, and monitoring risks while enabling informed decision-making through comprehensive risk intelligence and governance.

## Contact

- **Risk Management Director**: [[Jordan Taylor]]
- **Slack Channel**: `#risk-management`

## Related Units

- [[../Operations/README|Operations Unit]] - Collaboration on operational risk management
- [[../Compliance/README|Compliance Unit]] - Coordination on regulatory compliance risks
- [[../Security/README|Security Unit]] - Partnership on security-related risks
