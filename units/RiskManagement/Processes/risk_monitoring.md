# Risk Monitoring and Review Process

## 1. Purpose
To continuously track and review risks, the effectiveness of treatment plans, changes in the internal and external context, and the overall performance of the risk management process, ensuring its ongoing relevance and effectiveness.

## 2. Scope
This process applies to all identified risks in the [[Risk Register]], implemented risk treatment plans, and the overall risk management framework and process.

## 3. Process Steps

```mermaid
graph TD
    A[Start: Risks, Treatment Plans, Context] --> B{Monitor Risks & Controls};
    B -- KRIs/KPIs --> C[Collect Monitoring Data];
    B -- Audits/Assessments --> C;
    B -- Incident Tracking --> C;
    B -- Context Scanning --> C;
    C --> D{Analyze Monitoring Results};
    D --> E{Review Effectiveness};
    E -- Effective --> F[Continue Monitoring];
    E -- Ineffective --> G{Identify Issues/Deviations};
    G --> H[Trigger Re-assessment/Treatment Adjustment];
    H --> I(Update Risk Register);
    F --> I;
    I --> J{Report Findings};
    J --> K[End: Monitoring Complete, Feedback Loop Activated];

    subgraph Monitoring Activities
        B1(Track Key Risk Indicators - KRIs)
        B2(Review Control Performance)
        B3(Scan Internal/External Environment)
        B4(Monitor Treatment Plan Progress)
        B5(Track Incident Data)
        B --> B1; B --> B2; B --> B3; B --> B4; B --> B5;
    end

    subgraph Reporting
        J1(Regular Risk Reports)
        J2(Exception Reports)
        J3(Escalation Reports)
        J --> J1; J --> J2; J --> J3;
    end
```text

### 3.1. Monitor Risks and Controls
- **Activity:** Continuously or periodically track identified risks and the performance of associated controls and treatment plans. Activities include:
    - **Tracking Key Risk Indicators (KRIs):** Monitoring predefined metrics that provide early warning signals of increasing risk exposure.
    - **Reviewing Control Performance:** Assessing whether controls are operating as intended and remain effective.
    - **Monitoring Treatment Plan Progress:** Tracking the implementation status and milestones of action plans.
    - **Scanning Context:** Monitoring changes in the internal and external environment that could impact existing risks or introduce new ones.
    - **Tracking Incidents:** Analyzing incident data for trends or failures related to identified risks.
- **Responsibility:** Process/Project/Unit Owners, Control Owners, RMU.
- **Inputs:** [[Risk Register]], Treatment Plans, KRIs, Control documentation, Context information, Incident logs.

### 3.2. Collect Monitoring Data
- **Activity:** Gather data and information from the various monitoring activities.
- **Responsibility:** Process/Project/Unit Owners, Control Owners, RMU.

### 3.3. Analyze Monitoring Results
- **Activity:** Analyze the collected data to understand trends, identify deviations from expected performance, and assess the current risk landscape.
- **Responsibility:** Process/Project/Unit Owners, RMU.
- **Inputs:** Monitoring data, performance targets, KRIs thresholds.

### 3.4. Review Effectiveness
- **Activity:** Evaluate the effectiveness of risk treatment plans and controls based on the analysis. Determine if residual risk levels remain within tolerance and if the overall risk management approach is working.
- **Responsibility:** Process/Project/Unit Owners, RMU, Management.
- **Inputs:** Analysis results, risk tolerance levels, treatment plan objectives.

### 3.5. Identify Issues/Deviations
- **Activity:** If monitoring indicates that treatments or controls are ineffective, residual risk exceeds tolerance, new risks have emerged, or significant context changes have occurred, identify these issues.
- **Responsibility:** Process/Project/Unit Owners, RMU.

### 3.6. Trigger Re-assessment / Treatment Adjustment
- **Activity:** Based on identified issues, initiate a review and potential update of the risk assessment ([[risk_assessment.md]]) or treatment plan ([[risk_treatment.md]]).
- **Responsibility:** RMU, Process/Project/Unit Owners.

### 3.7. Update Risk Register
- **Activity:** Document the results of monitoring activities, reviews, and any subsequent changes to assessments or treatment plans in the [[Risk Register]].
- **Responsibility:** RMU, Process/Project/Unit Owners.

### 3.8. Report Findings
- **Activity:** Communicate monitoring results, review outcomes, and the overall risk profile to relevant stakeholders (e.g., Management, Risk Committee, Board) through regular and exception-based reporting. Escalate significant issues as needed.
- **Responsibility:** RMU, Process/Project/Unit Owners.

## 4. Inputs
- [[Risk Register]] (including assessments and treatment plans)
- [[risk_treatment.md]] outputs
- Key Risk Indicators (KRIs)
- Control documentation and performance data
- Incident reports and data
- Internal/External context information
- Audit reports / Assessment results
- Stakeholder feedback

## 5. Outputs
- Monitoring and Review Reports.
- Updated [[Risk Register]] reflecting current status and changes.
- Evidence of treatment plan and control effectiveness (or lack thereof).
- Identification of emerging risks or changes in existing risks.
- Recommendations for adjustments to assessments, treatments, or controls.
- Input for continuous improvement of the ERM framework.

## 6. Tools and Techniques
- Key Risk Indicators (KRIs)
- Control Self-Assessments (CSAs)
- Independent Audits / Reviews
- Performance Dashboards
- Incident Management Systems
- Environmental Scanning Techniques
- Trend Analysis
- Risk Reporting Templates
- Risk Register Software/Template

## 7. Roles and Responsibilities
- **Risk Management Unit (RMU):** Oversees the monitoring process, defines KRIs framework, aggregates monitoring data, prepares reports for senior management/Board, facilitates reviews.
- **Process/Project/Unit Owners:** Monitor risks and treatment plans within their scope, report on status and effectiveness, conduct periodic reviews.
- **Control Owners:** Monitor the performance and effectiveness of specific controls.
- **Action Owners:** Report on the progress of specific treatment actions.
- **Internal Audit:** Provides independent assurance on the monitoring process and control effectiveness.
- **Management / Risk Committee:** Review monitoring reports, oversee response to significant issues, ensure overall framework effectiveness.

## 8. Review and Update
- Monitoring frequency should be determined based on the nature of the risk and the rate of change in the environment (ranging from continuous to annual).
- This process document will be reviewed annually by the RMU.

---
**Version:** 1.0
**Effective Date:** [Date]
**Process Owner:** Head of [[Risk Management]]
**Next Review Date:** [Date + 1 Year] 