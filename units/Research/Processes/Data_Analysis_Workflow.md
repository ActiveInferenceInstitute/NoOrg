# Research Data Analysis Workflow

**Version:** 1.0
**Date:** YYYY-MM-DD
**Status:** Draft
**Owner:** Research Unit Lead

## 1. Purpose

This document describes the general workflow for analyzing research data within the Research Unit, promoting consistency, reproducibility, and quality.

## 2. Scope

This workflow applies to the analysis phase of research projects conducted within the Research Unit, following data collection and preceding interpretation.

## 3. Workflow Diagram

```mermaid
graph TD
    A[Data Acquisition/Receipt] --> B(Data Cleaning & Preprocessing);
    B --> C{Exploratory Data Analysis (EDA)};
    C --> D[Formal Analysis / Modeling];
    D --> E[Results Generation];
    E --> F{Validation & Quality Check};
    F -- Valid --> G[Documentation & Reporting];
    F -- Invalid --> B;  // Or D depending on issue
    G --> H(Interpretation);

    subgraph Steps
        A; B; C; D; E; F; G; H;
    end

    subgraph Tools & Techniques (Examples)
        B --> B1(Handling Missing Values, Outlier Detection, Normalization);
        C --> C1(Visualization, Summary Statistics);
        D --> D1(Statistical Tests, Machine Learning Models, Simulations);
        E --> E1(Tables, Figures, Metrics);
        F --> F1(Code Review, Sensitivity Analysis, Cross-Validation);
        G --> G1(Analysis Report, Code Scripts, Processed Datasets);
    end

    style B1 fill:#f9f,stroke:#333,stroke-width:1px
    style C1 fill:#f9f,stroke:#333,stroke-width:1px
    style D1 fill:#f9f,stroke:#333,stroke-width:1px
    style E1 fill:#f9f,stroke:#333,stroke-width:1px
    style F1 fill:#f9f,stroke:#333,stroke-width:1px
    style G1 fill:#f9f,stroke:#333,stroke-width:1px
```

## 4. Steps Description

1.  **Data Acquisition/Receipt:** Obtain the raw or collected data according to the Data Management Plan (DMP).
2.  **Data Cleaning & Preprocessing:** Prepare data for analysis. This includes handling missing values, correcting errors, transforming variables, normalizing/scaling data, and structuring datasets appropriately.
3.  **Exploratory Data Analysis (EDA):** Understand the data's characteristics through visualization and summary statistics. Identify patterns, trends, anomalies, and potential relationships to inform formal analysis.
4.  **Formal Analysis / Modeling:** Apply planned statistical tests, algorithms, or models to address the research questions or hypotheses. This may involve hypothesis testing, regression analysis, machine learning model training, simulation, etc.
5.  **Results Generation:** Produce outputs from the analysis, such as statistical summaries, tables, figures, model parameters, and performance metrics.
6.  **Validation & Quality Check:** Verify the correctness and robustness of the analysis and results. This can include code reviews, checking assumptions, sensitivity analysis, cross-validation, or comparison with known outcomes.
7.  **Documentation & Reporting:** Document the analysis steps, code/scripts used, parameters, and key results clearly and comprehensively to ensure reproducibility. Prepare results for inclusion in reports or publications.
8.  **Interpretation:** Proceed to the interpretation phase (covered in [[Research_Project_Lifecycle.md]]) based on the validated and documented results.

## 5. Best Practices

*   **Reproducibility:** Use scripting languages (e.g., Python, R) and version control (e.g., Git) for analysis. Document environments and dependencies.
*   **Code Quality:** Write clear, commented, and modular code. Conduct peer reviews of analysis code where feasible.
*   **Data Integrity:** Work on copies of raw data; never modify original datasets directly during analysis.
*   **Metadata:** Maintain clear metadata describing variables, transformations, and analysis steps.
*   **Validation:** Rigorously validate analysis methods and results.

## 6. Tools & Software

*   Specify standard or recommended tools (e.g., Python libraries like Pandas, NumPy, Scikit-learn; R packages; SPSS; MATLAB).
*   Reference organizational licenses or approved software lists.

## 7. Related Documents

*   [[Research_Project_Lifecycle.md]]
*   [[../Policies/Data_Handling_Policy.md]]
*   [[../Policies/Research_Ethics_Policy.md]]
*   [Data Management Plan (Specific Project)]

## 8. Review Cycle

This workflow document will be reviewed annually. 