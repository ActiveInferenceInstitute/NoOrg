# Risk Committee

## Overview

The Risk Committee provides expert advisory oversight on enterprise risk management, assessing strategic, operational, financial, and compliance risks. The committee collaborates closely with the [[../../../RiskManagement/README|Risk Management Unit]] while maintaining an independent advisory perspective.

```mermaid
graph TD
    subgraph RiskCommittee [Risk Committee Structure]
        direction LR
        Charter[[Charter]]
        Meetings[[Meeting Notes]]
        Reports[[Reports]]
        Members[[Members]]
    end

    subgraph FocusAreas [Focus Areas]
        direction LR
        StrategicRisk[Strategic Risks]
        OperationalRisk[Operational Risks]
        FinancialRisk[Financial Risks]
        ComplianceRisk[Compliance Risks]
        EmergingRisk[Emerging Risks]
    end

    RiskCommittee --> FocusAreas
    RiskCommittee -.-> RMU[Risk Management Unit]
    RiskCommittee -.-> RiskWorkingGroup[Risk Working Group]
    
    class RMU,RiskWorkingGroup externalEntity;
```text

## Key Responsibilities

- Advise on risk appetite and tolerance levels
- Review enterprise risk management framework and methodologies
- Evaluate effectiveness of risk identification and assessment processes
- Monitor significant and emerging risks
- Provide independent perspective on risk mitigation strategies
- Assess organizational resilience and crisis preparedness

## Committee Membership

- **Chair**: [[Dr. Richard Harris]] - Former Chief Risk Officer, Global Financial Group
- **Members**:
  - [[Sarah Chen]] - Cybersecurity and Technology Risk Expert
  - [[James Wilson]] - Regulatory and Compliance Specialist
  - [[Maria Rodriguez]] - Strategic Risk Management Consultant
  - [[David Thompson]] - Operational Resilience Expert

## Meeting Schedule

The Risk Committee meets quarterly and conducts additional sessions as needed for emerging risk issues. Schedule details are maintained in [[MeetingNotes/Schedule|meeting schedule]].

## Key Documents

- [[Charter|Committee Charter]]
- [[Processes/RiskReview|Risk Review Process]]
- [[Reports/README|Committee Reports]]
- [[MeetingNotes/README|Meeting Notes]]

## Related Entities

- [[../../../RiskManagement/README|Risk Management Unit]]
- [[../../../RiskAdvisoryBoard/README|Risk Advisory Board]]
- [[../../WorkingGroups/RiskGroup/README|Risk Working Group]]
- [[../ComplianceCommittee/README|Compliance Committee]]
- [[../AuditCommittee/README|Audit Committee]] 