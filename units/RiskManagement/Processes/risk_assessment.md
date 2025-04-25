# Risk Assessment Process

## 1. Purpose
To analyze and evaluate identified risks to understand their potential impact and likelihood, enabling prioritization and informed decisions regarding risk treatment.

## 2. Scope
This process applies to all risks identified through the [[risk_identification.md]] process and documented in the [[Risk Register]].

## 3. Process Steps

```mermaid
graph TD
    A[Start: Identified Risks from Register] --> B(Risk Analysis);
    B --> C{Determine Likelihood};
    B --> D{Determine Impact/Consequence};
    C --> E{Determine Level of Risk};
    D --> E;
    E --> F(Risk Evaluation);
    F --> G{Compare against Criteria};
    G -- Criteria Met --> H{Prioritize Risks};
    G -- Criteria Not Met --> I[Accept Risk (Document Rationale)];
    H --> J[Update Risk Register with Assessment];
    I --> J;
    J --> K[End: Assessed & Prioritized Risks];

    subgraph Analysis Inputs
        B1(Risk Description)
        B2(Historical Data)
        B3(Stakeholder Input)
        B4(Existing Controls)
        B --> B1;
        B --> B2;
        B --> B3;
        B --> B4;
    end

    subgraph Evaluation Inputs
        F1(Level of Risk)
        F2(Risk Appetite/Tolerance)
        F3(Risk Criteria)
        F --> F1;
        F --> F2;
        F --> F3;
    end
```

### 3.1. Risk Analysis
- **Activity:** Analyze each identified risk to understand its nature, sources, causes, likelihood, and potential consequences.
    - **Determine Likelihood:** Estimate the probability or frequency of the risk event occurring. This can be qualitative (e.g., Rare, Unlikely, Possible, Likely, Almost Certain) or quantitative (e.g., percentage probability, frequency per year), based on defined scales.
    - **Determine Impact/Consequence:** Assess the potential effect on organizational objectives if the risk event occurs. This can cover various categories (e.g., financial, operational, reputational, safety, compliance) and be rated qualitatively (e.g., Insignificant, Minor, Moderate, Major, Catastrophic) or quantitatively (e.g., monetary value), based on defined scales.
    - **Consider Existing Controls:** Evaluate the effectiveness of current controls in mitigating the likelihood or impact of the risk.
- **Responsibility:** Process/Project/Unit Owner, RMU, SMEs.
- **Inputs:** Identified risks, historical data, expert judgment, control assessments, defined likelihood/impact scales.

### 3.2. Determine Level of Risk
- **Activity:** Combine the likelihood and impact ratings to determine an overall level of risk for each identified item. This is often done using a predefined Risk Matrix (Heat Map) that correlates likelihood and impact scales to a risk level (e.g., Low, Medium, High, Extreme).
- **Responsibility:** Process/Project/Unit Owner, RMU.
- **Inputs:** Likelihood rating, Impact rating, Risk Matrix.

### 3.3. Risk Evaluation
- **Activity:** Compare the determined level of risk against the organization's predefined risk criteria and risk appetite/tolerance levels.
    - **Compare against Criteria:** Assess whether the level of risk is acceptable or requires treatment based on criteria defined in the [[ERM Policy]] and [[Risk Appetite Statement]].
- **Responsibility:** Process/Project/Unit Owner, RMU, Management.
- **Inputs:** Level of risk, Risk criteria, Risk appetite/tolerance.

### 3.4. Prioritize Risks
- **Activity:** Rank risks based on their evaluated level and significance. This prioritization informs the urgency and resource allocation for risk treatment.
- **Responsibility:** RMU, Management, Risk Committee.
- **Inputs:** Evaluated risk levels, organizational priorities, risk appetite.

### 3.5. Update Risk Register
- **Activity:** Document the results of the analysis and evaluation in the [[Risk Register]]. This includes likelihood rating, impact rating, overall risk level, evaluation outcome (e.g., accept, treat), priority, and rationale.
- **Responsibility:** RMU, Process/Project/Unit Owner.

## 4. Inputs
- [[Risk Register]] (with identified risks)
- [[risk_identification.md]] outputs
- Organizational context and objectives
- Defined Likelihood and Impact Scales
- Risk Matrix
- [[Risk Appetite Statement]]
- Risk Criteria (from [[ERM Policy]])
- Information on existing controls
- Historical data and analysis
- Stakeholder consultation results

## 5. Outputs
- Updated [[Risk Register]] with risk analysis, evaluation, levels, and prioritization.
- List of risks requiring treatment.
- List of risks deemed acceptable (with rationale).
- Input for [[risk_treatment.md]] process.

## 6. Tools and Techniques
- Risk Matrix / Heat Map
- Qualitative Assessment Scales (Likelihood, Impact)
- Quantitative Assessment Methods (if applicable, e.g., Monte Carlo simulation, VaR)
- Control Effectiveness Assessment
- Expert Judgment / Delphi Technique
- Workshops
- Risk Register Software/Template

## 7. Roles and Responsibilities
- **Risk Management Unit (RMU):** Facilitates the process, provides tools (scales, matrix), maintains Risk Register, aggregates results, advises on criteria.
- **Process/Project/Unit Owners:** Lead assessment within their scope, provide context, contribute to analysis and evaluation.
- **Subject Matter Experts (SMEs):** Provide specialized input for analyzing specific types of risks.
- **Management / Risk Committee:** Review high-priority risks, confirm evaluation against appetite, approve priorities.

## 8. Review and Update
- Risk assessments should be reviewed and updated periodically (aligned with risk identification reviews) or when significant changes occur (e.g., changes in context, objectives, incidents).
- This process document will be reviewed annually by the RMU.

---
**Version:** 1.0
**Effective Date:** [Date]
**Process Owner:** Head of [[Risk Management]]
**Next Review Date:** [Date + 1 Year] 