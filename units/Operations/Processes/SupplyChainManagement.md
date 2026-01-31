# Supply Chain Management Process (Operational)

## Process Overview
**Type**: Core
**Owner**: [[Operations Manager]] (or dedicated Supply Chain Lead)
**Version**: 0.1
**Status**: Draft

## Purpose and Scope
### Purpose
To manage the tactical execution of supply chain activities within the Operations Unit, including procurement of operational materials/services, inventory management, and logistics coordination, ensuring timely availability of resources needed for service delivery and operations.

### Scope
- **In Scope**: Operational procurement (non-strategic), inventory control for operational stock, inbound/outbound logistics coordination for operations, supplier performance monitoring (operational level).
- **Out of Scope**: Strategic sourcing, corporate supply chain strategy, large capital procurement (handled by corporate Supply Chain / Finance).

## Process Details
### Prerequisites
1. Approved supplier list (from corporate Supply Chain).
2. Demand forecasts and operational plans.
3. Access to ERP/Supply Chain Platform.
4. Inventory storage facilities and procedures.

### Inputs
1. Purchase Requisition / Demand Signal
   - Source: Operational Teams, Planning Systems, Inventory Thresholds
   - Format: System request, email, form
   - Validation: Authorized requestor, clear requirements

2. Supplier Information & Contracts
   - Source: Corporate Supply Chain, ERP System
   - Format: Database records, Contract documents
   - Validation: Active supplier status, valid contract terms

### Process Steps
```mermaid
flowchart TD
    A(Start: Receive Demand/Requisition) --> B(Validate Need & Check Inventory)
    B -- Stock Available --> C(Allocate Inventory)
    B -- Stock Needed --> D(Select Supplier & Create PO)
    D --> E(Approve Purchase Order)
    E --> F(Transmit PO to Supplier)
    F --> G(Monitor Supplier Confirmation & Delivery)
    G --> H(Receive Goods/Services)
    H --> I(Perform Quality Check / Receipt Verification)
    I --> J(Update Inventory / Confirm Service Receipt)
    J --> K(Approve Supplier Invoice for Payment)
    C --> L(Track Inventory Usage)
    K --> L
    L --> M(End/Continuous Monitoring)
```text

1. Step 1: Requisition & Sourcing
   - Action: Validate need, check existing inventory, select approved supplier, create Purchase Order (PO).
   - Actor: Operations Staff, Operations Manager
   - Tools: ERP System, Inventory System
   - Output: Purchase Order

2. Step 2: Receiving & Inventory Management
   - Action: Receive goods/services, perform incoming QC checks, update inventory records, store materials.
   - Actor: Operations Staff, QA Staff
   - Tools: ERP System, Inventory System, QC Checklists
   - Output: Goods Receipt Note, Updated Inventory Levels

3. Step 3: Invoice Approval & Monitoring
   - Action: Match invoice to PO and receipt, approve for payment (liaise with Finance), monitor supplier performance (on-time delivery, quality).
   - Actor: Operations Manager, Finance Clerk
   - Tools: ERP System, Supplier Scorecards
   - Output: Approved Invoice, Supplier Performance Data

### Outputs
1. Procured Goods / Services
   - Type: Material/Service
   - Format: As specified in PO
   - Destination: Inventory, Operational Teams
   - Usage: Fulfills operational requirements

2. Updated Inventory Records
   - Type: Data
   - Format: ERP/Inventory System Data
   - Destination: Operational Systems
   - Usage: Tracking stock levels, planning

3. Supplier Performance Data
   - Type: Data/Report
   - Format: Scorecard, Report
   - Destination: Operations Manager, Corporate Supply Chain
   - Usage: Supplier evaluation, relationship management

## Roles and Responsibilities
- [[Operations Manager]]: Oversees the process, approves POs (within limit), manages supplier relationships (operational level).
- Operational Staff: Raise requisitions, receive goods, manage local inventory.
- Finance Clerk (or AP): Processes invoice payments.
- Corporate Supply Chain: Manages strategic sourcing, approves suppliers, sets overall policy.

## Controls and Metrics
### Process Controls
- Purchase Order Approval Workflow
- Three-Way Matching (PO, Receipt, Invoice)
- Inventory Cycle Counting
- Approved Supplier List Usage

### Performance Metrics
- Purchase Order Cycle Time
- On-Time Delivery Rate (Suppliers) (%)
- Incoming Quality Acceptance Rate (%)
- Inventory Accuracy (%)
- Stock Out Rate (%)
- Procurement Cost Savings (Operational level)

## Systems and Tools
- [[ERP System]] (Procurement, Inventory Modules)
- [[Supply Chain Platform]] (if separate)
- [[Inventory Management System]] (if separate)
- [[Supplier Portal]] (optional)

## Exceptions and Error Handling
- Supplier Delivery Delays: Expediting, communication, alternative sourcing (if critical).
- Quality Rejections: Return process, supplier communication, CAPA if systemic.
- Invoice Discrepancies: Investigation and resolution with supplier/Finance.
- Stock Outs: Emergency procurement procedures, root cause analysis.

## Related Processes
- [[ResourceOptimization]]
- [[QualityControl]] (Incoming QC)
- [[ServiceDelivery]] (Requires materials/services)
- Financial Accounts Payable Process
- Corporate Strategic Sourcing Process

## Documentation and Training
- Procurement Policy (Operational limits)
- Receiving Procedures
- Inventory Management Procedures
- Training on ERP/Supply Chain systems.

## Compliance and Audit
- Adherence to procurement policies and approval limits.
- Audit trail for procurement and inventory transactions.
- Compliance with financial controls (e.g., SOX if applicable).

## Change Management
- Changes to preferred suppliers or inventory policies require coordination with Corporate Supply Chain and Finance.

---
**Metadata**
- Created: <% tp.date.now("YYYY-MM-DD") %>
- Last Updated: <% tp.date.now("YYYY-MM-DD") %>
- Owner: [[Operations Manager]]
- Contributors: [[Finance Representative]], [[Corporate Supply Chain Contact]]
- Review Status: Draft
- Security Classification: Internal 