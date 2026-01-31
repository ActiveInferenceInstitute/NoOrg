# Data Management Plan (DMP) Creation Process

**Version:** 1.0
**Date:** YYYY-MM-DD
**Status:** Draft
**Owner:** Research Unit Lead

## 1. Purpose

This document outlines the process for creating a Data Management Plan (DMP) for research projects within the Research Unit. A DMP describes how research data will be managed throughout the project lifecycle and after its completion.

## 2. Scope

This process applies to all research projects initiated within the Research Unit that generate or collect data, as required by [[../Policies/Data_Handling_Policy.md]].

## 3. Process Flow

```mermaid
graph TD
    A[Project Initiation / Planning Phase] --> B(Identify Data Types & Sources);
    B --> C(Determine Metadata Standards);
    C --> D(Plan Data Storage & Backup Strategy);
    D --> E(Define Data Security Measures);
    E --> F(Outline Data Access & Sharing Policies);
    F --> G(Establish Data Preservation & Retention Plan);
    G --> H(Assign Roles & Responsibilities for DMP);
    H --> I(Draft DMP Document using Template/Tool);
    I --> J{Review DMP (Internal/Stakeholder)};
    J -- Approved --> K(Finalize & Store DMP);
    J -- Revisions Needed --> I;
    K --> L(Implement DMP during Project Execution);
    L --> M{Update DMP as Needed};
    M -- Yes --> I;
    M -- No --> N(Execute Retention/Disposal per DMP at Project End);

    subgraph DMP Development
        A; B; C; D; E; F; G; H; I; J; K;
    end

    subgraph DMP Lifecycle
        L; M; N;
    end
```text

## 4. Steps Description

1.  **Identify Data Types & Sources:** Determine what kinds of data will be generated or collected (e.g., survey results, experimental measurements, code, simulations, interview transcripts). Note formats, expected volume.
2.  **Determine Metadata Standards:** Define how data will be documented (metadata) to ensure it is understandable and reusable (e.g., variable definitions, codebooks, experimental conditions).
3.  **Plan Data Storage & Backup:** Select appropriate, secure storage solutions (referencing approved organizational platforms). Define the backup frequency and procedures.
4.  **Define Data Security Measures:** Based on data sensitivity (see [[../Policies/Data_Handling_Policy.md]]), specify security controls (access controls, encryption, anonymization needs).
5.  **Outline Data Access & Sharing Policies:** Define who will have access to the data during and after the project. Outline conditions and procedures for sharing data (internally/externally), considering ethical and IP constraints.
6.  **Establish Data Preservation & Retention Plan:** Determine which data needs to be preserved long-term, for how long (retention period), and where it will be archived. Plan for data disposal.
7.  **Assign Roles & Responsibilities:** Clearly define who is responsible for implementing and overseeing the DMP activities.
8.  **Draft DMP Document:** Compile the information into a formal DMP document using an approved template or online tool (e.g., DMPTool, institutional template).
9.  **Review DMP:** Have the draft DMP reviewed by relevant stakeholders (e.g., PI, Research Lead, IT, Ethics Committee if applicable).
10. **Finalize & Store DMP:** Incorporate feedback, finalize the DMP, and store it in a designated project location.
11. **Implement DMP:** Follow the plan during the project execution phase (see [[Research_Project_Lifecycle.md]]).
12. **Update DMP:** Review and update the DMP if significant changes occur during the project (e.g., new data types, changes in storage, new sharing agreements).
13. **Execute Retention/Disposal:** Follow the DMP's plan for data archiving, sharing, or disposal at the end of the project lifecycle and retention period.

## 5. Templates & Tools

*   [Link to Organizational DMP Template]
*   [Link to DMPTool or other recommended tool]
*   Refer to funder-specific DMP requirements if applicable.

## 6. Related Documents

*   [[../Policies/Data_Handling_Policy.md]]
*   [[../Policies/Research_Ethics_Policy.md]]
*   [[Research_Project_Lifecycle.md]]
*   [Organization's IT Security Policy]
*   [Organization's Data Retention Schedule]

## 7. Review Cycle

This process document will be reviewed annually. 