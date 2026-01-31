# Hardware Procurement Process

**Version:** 1.0  
**Effective Date:** [Date]  
**Last Reviewed:** [Date]

## 1. Purpose

To define the standardized workflow for requesting, approving, purchasing, receiving, and deploying IT hardware assets to meet business needs.

## 2. Scope

This process applies to all IT hardware procurement activities, including desktops, laptops, servers, network devices, peripherals, and accessories.

## 3. Prerequisites

*   Approved Hardware Request ticket in the ITSM system.
*   Budget allocation and approved vendor list.
*   Standard hardware specifications and asset tags defined.

## 4. Procedure Steps

1.  **Request Submission:**  
    *   User or manager submits a Hardware Request in ITSM, specifying hardware type, quantity, and business justification.
2.  **Review & Approval:**  
    *   IT Procurement reviews specifications, confirms budget availability, and obtains manager approval.
3.  **Vendor Selection & Purchase Order (PO):**  
    *   Procurement team selects vendor from approved list, negotiates pricing, and issues a PO.
4.  **Order Tracking:**  
    *   Track order status and estimated delivery date via vendor portal or procurement system.
5.  **Receiving & Inspection:**  
    *   Upon delivery, inspect hardware for damage and verify compliance with specifications.
    *   Record serial numbers and assign asset tags.
6.  **Asset Registration:**  
    *   Enter hardware details into the IT Asset Management system.
7.  **Configuration & Deployment:**  
    *   IT configures hardware with standard OS image, security baseline, and required software.
    *   Deploy assets to end users or install in data center.
8.  **Documentation & Closure:**  
    *   Update procurement records with invoices and receipts.
    *   Close the Hardware Request ticket in ITSM.

## 5. Roles and Responsibilities

*   **Requester:** Submits hardware request with justification.
*   **IT Procurement:** Reviews requests, manages vendor interactions, issues PO.
*   **Receiving Team:** Inspects and records incoming hardware.
*   **IT Operations:** Configures and deploys hardware.
*   **Asset Manager:** Updates inventory and asset records.

## 6. Workflow Diagram

```mermaid
graph LR
    A[Submit Hardware Request] --> B{Review & Approval}
    B -- Approved --> C[Select Vendor & Issue PO]
    B -- Rejected --> D[Notify Requester & Close Request]
    C --> E[Track Order]
    E --> F[Receive & Inspect Hardware]
    F --> G[Register Asset in Inventory]
    G --> H[Configure & Deploy]
    H --> I[Close Hardware Request Ticket]
```text 