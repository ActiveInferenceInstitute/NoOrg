#!/usr/bin/env python3
"""
Add domain-specific content for units with fewer files:
Marketing, Administration, BusinessDevelopment, Facilities, SupplyChain,
TrainingDevelopment, ExecutiveCommittee, ProductManagement
"""

from pathlib import Path

UNITS_DIR = Path("/Users/4d/Documents/GitHub/NoOrg/units")

UNIT_CONTENT = {
    "Marketing": {
        "Policies": [
            ("Digital_Marketing_Policy.md", """# Digital Marketing Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Digital Marketing

## Purpose

Establishes standards for digital marketing activities across all channels.

## Scope

Applies to all digital marketing including website, social media, email, paid advertising, and content marketing.

## Channel Standards

### Website
| Element | Standard |
|---------|----------|
| Branding | Consistent with brand guidelines |
| UX | Mobile-first, accessible |
| Performance | < 3s load time |
| SEO | Optimized content and structure |
| Analytics | Full tracking implementation |

### Social Media
| Platform | Purpose | Cadence |
|----------|---------|---------|
| LinkedIn | B2B, thought leadership | Daily |
| Twitter/X | News, engagement | Multiple daily |
| Instagram | Brand, culture | 3-5x weekly |
| YouTube | Product, education | Weekly |

### Email Marketing
| Type | Standards |
|------|-----------|
| Opt-in | Double opt-in required |
| Frequency | Max 2x/week per list |
| Content | Value-driven, personalized |
| Compliance | CAN-SPAM, GDPR compliant |
| Testing | A/B test all campaigns |

### Paid Advertising
| Channel | Governance |
|---------|------------|
| Search | Approved keywords only |
| Display | Brand-safe placements |
| Social | Targeting guidelines |
| Programmatic | Viewability standards |

## Data and Privacy

| Requirement | Implementation |
|-------------|----------------|
| Consent | Explicit opt-in |
| Tracking | Privacy-compliant |
| Data usage | Documented purpose |
| Retention | Per privacy policy |

## Performance Metrics

| Channel | Key Metrics |
|---------|-------------|
| Website | Traffic, conversion, bounce |
| Social | Engagement, reach, growth |
| Email | Open rate, CTR, unsubscribe |
| Paid | ROAS, CPA, CTR |

## Related Documents

- [Brand Guidelines](../../MarketingCommunications/Policies/)
- [Content Standards](../../MarketingCommunications/Policies/)
"""),
            ("Campaign_Management_Policy.md", """# Campaign Management Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Marketing Director

## Purpose

Establishes standards for planning, executing, and measuring marketing campaigns.

## Campaign Types

| Type | Scope | Duration |
|------|-------|----------|
| Brand | Awareness, positioning | Ongoing |
| Product | Launch, features | 6-12 weeks |
| Demand | Lead generation | Ongoing |
| Event | Conferences, webinars | Event-specific |
| Seasonal | Holidays, quarters | 4-6 weeks |

## Campaign Planning

### Planning Requirements
| Element | Required Content |
|---------|------------------|
| Objectives | SMART goals |
| Audience | Target segments |
| Messaging | Key messages, value prop |
| Channels | Distribution plan |
| Budget | Detailed allocation |
| Timeline | Milestones, deadlines |
| Metrics | KPIs and targets |

### Approval Process
| Campaign Size | Approval Required |
|---------------|-------------------|
| < $25K | Marketing Manager |
| $25K - $100K | Marketing Director |
| $100K - $500K | CMO |
| > $500K | CMO + CFO |

## Campaign Execution

### Pre-Launch
| Activity | Timeline |
|----------|----------|
| Asset creation | 4 weeks before |
| Stakeholder review | 2 weeks before |
| System setup | 1 week before |
| Final approval | 3 days before |

### In-Market
| Activity | Frequency |
|----------|-----------|
| Performance monitoring | Daily |
| Optimization | Weekly |
| Stakeholder updates | Weekly |
| Issue resolution | As needed |

### Post-Campaign
| Activity | Timeline |
|----------|----------|
| Data collection | Within 1 week |
| Analysis | Within 2 weeks |
| Reporting | Within 3 weeks |
| Lessons learned | Within 4 weeks |

## Performance Measurement

| Category | Metrics |
|----------|---------|
| Reach | Impressions, unique visitors |
| Engagement | Clicks, time on site, shares |
| Conversion | Leads, MQLs, SQLs |
| Revenue | Pipeline, closed deals |
| Efficiency | Cost per lead, ROAS |

## Related Documents

- [Digital Marketing Policy](./Digital_Marketing_Policy.md)
- [Brand Guidelines](../../MarketingCommunications/Policies/)
"""),
        ],
        "Processes": [
            ("Marketing_Planning_Process.md", """# Marketing Planning Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Marketing Director

## Purpose

Defines the annual and quarterly marketing planning process.

## Planning Calendar

| Phase | Timing | Focus |
|-------|--------|-------|
| Annual Planning | Q4 (Oct-Nov) | Strategy, budget |
| Quarterly Planning | Month before quarter | Detailed tactics |
| Monthly Review | End of month | Performance, adjustments |
| Weekly Sync | Every Monday | Execution alignment |

## Annual Planning Process

### Phase 1: Assessment (Week 1-2)
| Activity | Owner |
|----------|-------|
| Market analysis | Strategy |
| Competitive review | Research |
| Performance review | Analytics |
| Customer insights | Customer Success |

### Phase 2: Strategy (Week 3-4)
| Activity | Owner |
|----------|-------|
| Goal setting | CMO + Leadership |
| Audience definition | Marketing |
| Positioning review | Brand |
| Channel strategy | Channel leads |

### Phase 3: Planning (Week 5-6)
| Activity | Owner |
|----------|-------|
| Campaign calendar | Campaign managers |
| Budget allocation | CMO + Finance |
| Resource planning | Operations |
| Technology needs | MarTech |

### Phase 4: Approval (Week 7-8)
| Activity | Participants |
|----------|--------------|
| Leadership review | CMO + VP |
| Executive approval | C-suite |
| Board presentation | CMO |
| Team communication | All marketing |

## Quarterly Planning

| Week | Activity |
|------|----------|
| 1 | Review previous quarter, analyze results |
| 2 | Define quarter priorities, allocate budget |
| 3 | Develop detailed plans, assign owners |
| 4 | Finalize calendar, prepare for execution |

## Related Documents

- [Campaign Management](../Policies/Campaign_Management_Policy.md)
- [Budget Process](../../Finance/Processes/)
"""),
        ],
    },
    "Administration": {
        "Policies": [
            ("Administrative_Services_Policy.md", """# Administrative Services Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Administrative Officer

## Purpose

Establishes standards for administrative services supporting organizational operations.

## Scope

Covers office management, mail services, travel coordination, event planning, and general administrative support.

## Office Management

### Workspace Standards
| Element | Standard |
|---------|----------|
| Cleanliness | Daily cleaning |
| Temperature | 68-72°F |
| Lighting | Adequate for tasks |
| Noise | Acceptable levels |
| Safety | Clear pathways |

### Supplies Management
| Category | Process |
|----------|---------|
| Standard supplies | Self-service ordering |
| Specialty items | Request and approval |
| Equipment | IT/Facilities coordination |
| Inventory | Monthly review |

## Mail and Shipping

### Incoming Mail
| Service | Delivery |
|---------|----------|
| Standard mail | Same day distribution |
| Packages | Notification within 2 hours |
| Priority/Legal | Immediate notification |

### Outgoing Mail
| Service | Cut-off |
|---------|---------|
| Standard mail | 3pm daily |
| Express | 4pm daily |
| International | 2pm daily |

## Travel Services

### Booking Requirements
| Element | Guideline |
|---------|-----------|
| Air travel | Book 14+ days in advance |
| Hotels | Preferred vendors |
| Ground transport | Pre-approved vendors |
| International | 30-day advance notice |

### Support Services
- Itinerary management
- Visa/passport assistance
- Emergency support
- Expense coordination

## Event Support

| Event Type | Support Level |
|------------|---------------|
| Internal meetings | Full support |
| Client events | Coordination |
| Executive events | Dedicated support |
| Large conferences | Project management |

## Related Documents

- [Facilities Management](../../Facilities/)
- [Expense Policy](../../Finance/Policies/)
"""),
            ("Records_Management_Policy.md", """# Records Management Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Records Manager

## Purpose

Establishes requirements for creating, managing, retaining, and disposing of organizational records.

## Scope

Applies to all records regardless of format, including physical documents, electronic files, emails, and databases.

## Record Categories

| Category | Description | Examples |
|----------|-------------|----------|
| Vital | Essential for operations | Contracts, IP |
| Important | Significant business value | Policies, financials |
| Useful | Operational reference | Procedures, reports |
| Non-essential | Limited ongoing value | Routine correspondence |

## Retention Schedule

| Record Type | Retention Period |
|-------------|------------------|
| Corporate records | Permanent |
| Financial records | 7 years |
| Tax records | 7 years |
| Employee records | 7 years after termination |
| Contracts | Life + 6 years |
| Correspondence | 3-5 years |
| Project files | 5 years after completion |

## Records Lifecycle

### Creation
| Requirement | Standard |
|-------------|----------|
| Naming | Consistent conventions |
| Metadata | Required fields |
| Classification | Category assignment |
| Storage | Approved locations |

### Maintenance
| Activity | Frequency |
|----------|-----------|
| Access review | Quarterly |
| Integrity check | Annually |
| Migration | As needed |

### Disposition
| Method | Use Case |
|--------|----------|
| Destruction | Expired retention |
| Archive | Historical value |
| Transfer | Successor entities |

## Legal Holds

| Trigger | Action |
|---------|--------|
| Litigation | Suspend destruction |
| Investigation | Preserve evidence |
| Regulatory inquiry | Maintain records |

## Related Documents

- [Information Security](../../Security/Policies/)
- [Privacy Policy](../../Legal/Policies/)
"""),
        ],
        "Processes": [
            ("Office_Operations_Process.md", """# Office Operations Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Office Manager

## Purpose

Defines processes for daily office operations and administrative activities.

## Daily Operations

### Opening Procedures
| Time | Activity | Owner |
|------|----------|-------|
| 7:00 AM | Unlock, security check | Facilities |
| 7:30 AM | Systems check | IT |
| 8:00 AM | Reception ready | Admin |
| 8:00 AM | Mail distribution | Admin |

### Closing Procedures
| Time | Activity | Owner |
|------|----------|-------|
| 6:00 PM | Final mail collection | Admin |
| 6:30 PM | Conference room reset | Admin |
| 7:00 PM | Security walkthrough | Security |
| 7:00 PM | Building lock-up | Facilities |

## Reception Services

### Visitor Management
| Step | Activity |
|------|----------|
| Arrival | Sign in, badge |
| Notification | Contact host |
| Escort | To meeting location |
| Departure | Badge return, sign out |

### Phone Handling
| Call Type | Response |
|-----------|----------|
| General inquiry | Route to department |
| Executive | Direct transfer |
| Sales | Marketing queue |
| Support | Customer Support |

## Meeting Support

### Room Booking
| Step | Process |
|------|---------|
| Request | Calendar system |
| Approval | Auto/manager |
| Setup | Pre-meeting prep |
| Support | Technical assistance |

### Catering Requests
| Request Type | Lead Time |
|--------------|-----------|
| Coffee/refreshments | 1 day |
| Light catering | 2 days |
| Full catering | 5 days |
| Special events | 2 weeks |

## Related Documents

- [Administrative Services](../Policies/Administrative_Services_Policy.md)
- [Facilities](../../Facilities/)
"""),
        ],
    },
    "BusinessDevelopment": {
        "Policies": [
            ("Partnership_Policy.md", """# Partnership Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** VP Business Development

## Purpose

Establishes guidelines for identifying, evaluating, and managing strategic partnerships.

## Partnership Types

| Type | Definition | Examples |
|------|------------|----------|
| Strategic | Market expansion | Go-to-market alliances |
| Technology | Product integration | Platform partnerships |
| Channel | Distribution | Reseller agreements |
| Co-development | Joint creation | Product development |
| Joint Venture | Shared entity | Market entry |

## Partnership Lifecycle

### Identification
| Activity | Output |
|----------|--------|
| Market analysis | Opportunity map |
| Partner research | Target list |
| Initial outreach | Expression of interest |

### Evaluation
| Criterion | Assessment |
|-----------|------------|
| Strategic fit | Alignment with goals |
| Capabilities | Complementary strengths |
| Financial health | Stability assessment |
| Cultural fit | Values alignment |
| Risk profile | Due diligence findings |

### Structuring
| Element | Consideration |
|---------|---------------|
| Deal type | Agreement structure |
| Economics | Revenue/cost sharing |
| Governance | Decision rights |
| IP | Ownership and licensing |
| Term | Duration and renewal |

### Execution
| Phase | Focus |
|-------|-------|
| Launch | Joint planning |
| Operations | Execution excellence |
| Optimization | Performance improvement |
| Review | Regular assessment |

## Approval Requirements

| Partnership Value | Approval |
|-------------------|----------|
| < $500K | VP BD |
| $500K - $2M | SVP |
| $2M - $10M | CEO |
| > $10M | Board |

## Related Documents

- [M&A Policy](./Mergers_Acquisitions_Policy.md)
- [Legal Contracts](../../Legal/Contracts/)
"""),
            ("Mergers_Acquisitions_Policy.md", """# Mergers & Acquisitions Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Strategy Officer

## Purpose

Establishes the framework for evaluating and executing M&A transactions.

## M&A Strategy

### Strategic Rationale
| Type | Purpose |
|------|---------|
| Market expansion | Geographic/segment growth |
| Capability acquisition | Skills and technology |
| Consolidation | Market share, synergies |
| Vertical integration | Supply chain control |
| Diversification | New markets/products |

## M&A Process

### Phase 1: Strategy
| Activity | Owner |
|----------|-------|
| Define criteria | Strategy |
| Identify targets | BD |
| Initial screening | BD + Finance |
| Preliminary valuation | Finance |

### Phase 2: Diligence
| Workstream | Lead |
|------------|------|
| Financial | Finance |
| Legal | Legal |
| Commercial | BD |
| Technology | IT |
| HR | Human Resources |
| Operations | Operations |

### Phase 3: Execution
| Activity | Owner |
|----------|-------|
| Negotiation | BD + Legal |
| Documentation | Legal |
| Regulatory approval | Legal |
| Closing | Cross-functional |

### Phase 4: Integration
| Focus | Owner |
|-------|-------|
| Integration planning | PMO |
| Day 1 readiness | Cross-functional |
| Synergy capture | Finance |
| Culture integration | HR |

## Governance

| Decision | Authority |
|----------|-----------|
| Initial pursuit | CEO |
| LOI execution | CEO |
| Final approval | Board |
| Integration budget | CFO |

## Related Documents

- [Partnership Policy](./Partnership_Policy.md)
- [Financial Controls](../../Finance/Policies/)
"""),
        ],
    },
    "Facilities": {
        "Policies": [
            ("Workplace_Policy.md", """# Workplace Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Facilities

## Purpose

Establishes standards for workplace environment, safety, and operations.

## Workplace Standards

### Physical Environment
| Element | Standard |
|---------|----------|
| Temperature | 68-72°F (20-22°C) |
| Humidity | 40-60% |
| Lighting | Task-appropriate levels |
| Noise | Acceptable for work type |
| Air quality | ASHRAE standards |

### Space Allocation
| Employee Type | Standard |
|---------------|----------|
| Executive | Private office |
| Manager | Office or large workstation |
| Individual contributor | Workstation |
| Shared | Collaborative areas |

## Safety Requirements

### Fire Safety
| Element | Requirement |
|---------|-------------|
| Exits | Clearly marked, unobstructed |
| Extinguishers | Inspected monthly |
| Alarms | Tested quarterly |
| Drills | Semi-annually |

### Emergency Preparedness
| Scenario | Response |
|----------|----------|
| Fire | Evacuation plan |
| Medical | First aid, AED locations |
| Weather | Shelter procedures |
| Security | Lockdown procedures |

## Access Control

### Building Access
| Level | Access Rights |
|-------|---------------|
| General | Common areas |
| Department | Work areas |
| Restricted | Sensitive areas |
| Executive | All areas |

### Hours of Operation
| Day | Hours |
|-----|-------|
| Monday-Friday | 7:00 AM - 7:00 PM |
| Weekend | By appointment |
| Holidays | Closed |

## Related Documents

- [Security Policies](../../Security/Policies/)
- [Health and Safety](./Health_Safety_Policy.md)
"""),
            ("Health_Safety_Policy.md", """# Health & Safety Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Facilities

## Purpose

Establishes health and safety standards to protect employees and visitors.

## Safety Commitment

| Principle | Application |
|-----------|-------------|
| Prevention | Proactive hazard management |
| Compliance | Meet all regulations |
| Training | Regular safety education |
| Reporting | Open incident reporting |
| Improvement | Continuous enhancement |

## Hazard Management

### Identification
| Source | Method |
|--------|--------|
| Inspections | Monthly walkthroughs |
| Reports | Employee submissions |
| Incidents | Investigation findings |
| Assessments | Periodic reviews |

### Control Hierarchy
| Level | Approach |
|-------|----------|
| Elimination | Remove hazard |
| Substitution | Replace with safer option |
| Engineering | Isolate hazard |
| Administrative | Change work practices |
| PPE | Personal protection |

## Incident Management

### Reporting Requirements
| Incident Type | Reporting |
|---------------|-----------|
| Near miss | 24 hours |
| Minor injury | Same day |
| Serious injury | Immediate |
| Fatality | Immediate |

### Investigation Process
| Step | Timeline |
|------|----------|
| Initial response | Immediate |
| Investigation | Within 48 hours |
| Root cause | Within 1 week |
| Corrective action | Within 2 weeks |
| Follow-up | Within 30 days |

## Training Requirements

| Training | Frequency |
|----------|-----------|
| New hire safety | Onboarding |
| Fire evacuation | Semi-annually |
| First aid | As needed |
| Job-specific | Role-based |

## Related Documents

- [Workplace Policy](./Workplace_Policy.md)
- [Emergency Response](../../Operations/Policies/)
"""),
        ],
    },
    "SupplyChain": {
        "Policies": [
            ("Supply_Chain_Risk_Management_Policy.md", """# Supply Chain Risk Management Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** VP Supply Chain

## Purpose

Establishes the framework for identifying and mitigating supply chain risks.

## Risk Categories

| Category | Examples |
|----------|----------|
| Supply | Supplier failure, capacity constraints |
| Demand | Forecast errors, demand volatility |
| Operational | Production, quality, logistics |
| External | Natural disasters, geopolitical, regulatory |
| Financial | Currency, commodity prices, supplier insolvency |

## Risk Assessment

### Risk Identification
| Method | Frequency |
|--------|-----------|
| Supplier assessments | Annually |
| Category analysis | Quarterly |
| External monitoring | Continuous |
| Scenario planning | Annually |

### Risk Scoring
| Factor | Weight |
|--------|--------|
| Likelihood | 40% |
| Impact | 40% |
| Detectability | 20% |

| Score | Risk Level | Action |
|-------|------------|--------|
| 1-3 | Low | Monitor |
| 4-6 | Medium | Mitigate |
| 7-9 | High | Urgent action |
| 10 | Critical | Immediate escalation |

## Mitigation Strategies

| Strategy | Application |
|----------|-------------|
| Diversification | Multiple suppliers |
| Inventory buffers | Safety stock |
| Contract terms | Performance guarantees |
| Insurance | Risk transfer |
| Partnerships | Collaborative relationships |

## Business Continuity

### Supplier Continuity
| Requirement | Standard |
|-------------|----------|
| Critical suppliers | BCP required |
| Single source | Backup identified |
| Geographic concentration | Alternate locations |
| Lead time exposure | Safety inventory |

## Monitoring and Reporting

| Activity | Frequency |
|----------|-----------|
| Risk dashboard | Weekly |
| Supplier performance | Monthly |
| Risk reviews | Quarterly |
| Board reporting | Annually |

## Related Documents

- [Procurement Policy](../../Procurement/Policies/)
- [Business Continuity](../../Operations/Policies/)
"""),
            ("Logistics_Policy.md", """# Logistics Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Logistics

## Purpose

Establishes standards for managing inbound and outbound logistics operations.

## Logistics Operations

### Inbound Logistics
| Activity | Standard |
|----------|----------|
| Receiving | Inspection within 24 hours |
| Put-away | Same-day shelf |
| Documentation | Complete and accurate |
| Discrepancy | Report within 4 hours |

### Outbound Logistics
| Activity | Standard |
|----------|----------|
| Order processing | Within 4 hours |
| Pick/pack | Same day |
| Shipping | Per customer SLA |
| Tracking | Real-time visibility |

## Carrier Management

### Carrier Selection
| Criterion | Weight |
|-----------|--------|
| Cost | 30% |
| Service level | 30% |
| Reliability | 25% |
| Capacity | 15% |

### Performance Metrics
| Metric | Target |
|--------|--------|
| On-time delivery | > 98% |
| Damage rate | < 0.5% |
| Cost per shipment | Within budget |
| Transit time | Per SLA |

## Inventory Management

### Inventory Levels
| Type | Policy |
|------|--------|
| Raw materials | 2-4 weeks supply |
| WIP | Minimize |
| Finished goods | Based on demand |
| Safety stock | Service level based |

### Storage Standards
| Requirement | Standard |
|-------------|----------|
| Organization | FIFO/LIFO as appropriate |
| Labeling | Clear identification |
| Conditions | Per product requirements |
| Security | Restricted access |

## Related Documents

- [Supply Chain Risk](./Supply_Chain_Risk_Management_Policy.md)
- [Procurement](../../Procurement/)
"""),
        ],
    },
    "TrainingDevelopment": {
        "Policies": [
            ("Learning_Development_Policy.md", """# Learning & Development Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Learning Officer

## Purpose

Establishes the framework for employee learning and professional development.

## Learning Philosophy

| Principle | Application |
|-----------|-------------|
| Continuous Learning | Ongoing skill development |
| Alignment | Business needs focus |
| Accessibility | Available to all employees |
| Measurement | Learning effectiveness |
| Investment | Competitive L&D spend |

## Learning Offerings

### Delivery Methods
| Method | Use Case |
|--------|----------|
| Instructor-led | Complex topics, interaction |
| E-learning | Self-paced, scalable |
| Virtual classroom | Remote participation |
| On-the-job | Practical application |
| Coaching/mentoring | Personalized development |
| External programs | Specialized expertise |

### Content Categories
| Category | Examples |
|----------|----------|
| Onboarding | New hire orientation |
| Technical | Job-specific skills |
| Leadership | Management development |
| Compliance | Required training |
| Professional | Soft skills |
| Career | Development planning |

## Training Requirements

### Mandatory Training
| Training | Audience | Frequency |
|----------|----------|-----------|
| Code of Conduct | All employees | Annual |
| Security Awareness | All employees | Annual |
| Anti-harassment | All employees | Annual |
| Manager essentials | All managers | Initial + refresh |
| Safety | Role-specific | Per requirements |

### Development Programs
| Level | Program |
|-------|---------|
| Individual Contributor | Skills development |
| First-line Manager | New leader program |
| Senior Manager | Leadership development |
| Executive | Executive education |

## Resources

### Time Allocation
| Level | Development Time |
|-------|------------------|
| All employees | Min 40 hours/year |
| Managers | Min 60 hours/year |
| High potentials | Enhanced investment |

### Financial Support
| Type | Support |
|------|---------|
| Internal programs | Fully funded |
| External courses | Up to $5,000/year |
| Degree programs | Per tuition policy |
| Certifications | Per certification policy |

## Related Documents

- [Career Development](./Career_Development_Policy.md)
- [Performance Management](../../HumanResources/Policies/)
"""),
            ("Career_Development_Policy.md", """# Career Development Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Learning Officer

## Purpose

Establishes guidelines for career development and advancement.

## Career Framework

### Career Tracks
| Track | Focus | Progression |
|-------|-------|-------------|
| Individual Contributor | Technical expertise | IC levels 1-7 |
| Management | People leadership | Manager to Executive |
| Technical Leadership | Technical + influence | Staff to Distinguished |

### Career Levels
| Level | Scope | Expectations |
|-------|-------|-------------|
| Entry | Learning, contributing | Develop foundational skills |
| Intermediate | Independent delivery | Own deliverables |
| Senior | Expert, influence | Mentor others, lead projects |
| Staff | Organizational impact | Strategic contributions |
| Principal | Enterprise impact | Shape direction |

## Development Planning

### Individual Development Plans
| Element | Content |
|---------|---------|
| Current assessment | Strengths, gaps |
| Career aspirations | Short and long-term goals |
| Development goals | Specific objectives |
| Action plan | Activities, timeline |
| Support needed | Resources, help |

### Planning Cycle
| Timing | Activity |
|--------|----------|
| Q1 | Set development goals |
| Quarterly | Progress review |
| Mid-year | Adjust as needed |
| Year-end | Evaluate and plan ahead |

## Development Opportunities

### Internal Mobility
| Type | Purpose |
|------|---------|
| Job posting | Open positions |
| Lateral moves | Broaden experience |
| Stretch assignments | Skill development |
| Job rotation | Cross-functional exposure |

### Career Conversations
| Frequency | Focus |
|-----------|-------|
| Monthly | Progress check |
| Quarterly | Development review |
| Annually | Career planning |

## Related Documents

- [Learning & Development](./Learning_Development_Policy.md)
- [Talent Management](../../HumanResources/Policies/)
"""),
        ],
    },
    "ProductManagement": {
        "Policies": [
            ("Product_Lifecycle_Policy.md", """# Product Lifecycle Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** VP Product Management

## Purpose

Establishes standards for managing products through their lifecycle stages.

## Lifecycle Stages

| Stage | Focus | Key Activities |
|-------|-------|----------------|
| Concept | Ideation | Discovery, validation |
| Development | Build | Design, engineering |
| Launch | Market entry | GTM execution |
| Growth | Scale | Adoption, optimization |
| Maturity | Sustain | Maintenance, efficiency |
| Decline/End | Sunset | Migration, retirement |

## Stage Gate Process

### Gate 0: Concept Approval
| Requirement | Criteria |
|-------------|----------|
| Market opportunity | Validated need |
| Strategic fit | Aligned with strategy |
| Initial business case | Positive potential |
| Resource feasibility | Capacity available |

### Gate 1: Development Approval
| Requirement | Criteria |
|-------------|----------|
| Detailed requirements | PRD complete |
| Business case | Positive NPV |
| Technical feasibility | Design approved |
| Go-to-market plan | Initial strategy |

### Gate 2: Launch Approval
| Requirement | Criteria |
|-------------|----------|
| Product readiness | Feature complete, tested |
| GTM readiness | Marketing, sales ready |
| Support readiness | Operations prepared |
| Success metrics | KPIs defined |

### Gate 3: Post-Launch Review
| Requirement | Criteria |
|-------------|----------|
| Performance vs. plan | Achievement analysis |
| Customer feedback | Satisfaction data |
| Next phase plan | Growth strategy |

## Product Governance

| Decision | Authority |
|----------|-----------|
| Stage gate approval | Product Council |
| Roadmap changes | VP Product |
| Feature prioritization | Product Manager |
| End-of-life | Product Council + Exec |

## Related Documents

- [Product Development Process](../Processes/)
- [Go-to-Market](../../Marketing/)
"""),
            ("Roadmap_Management_Policy.md", """# Roadmap Management Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** VP Product Management

## Purpose

Establishes standards for creating and managing product roadmaps.

## Roadmap Principles

| Principle | Application |
|-----------|-------------|
| Strategic alignment | Supports business goals |
| Customer-centric | Addresses customer needs |
| Feasible | Achievable with resources |
| Flexible | Adaptable to change |
| Transparent | Shared appropriately |

## Roadmap Structure

### Time Horizons
| Horizon | Detail Level | Confidence |
|---------|--------------|------------|
| Now (0-3 months) | Features, stories | High |
| Next (3-6 months) | Capabilities | Medium |
| Later (6-12 months) | Themes | Low |
| Future (12+ months) | Vision | Exploratory |

### Roadmap Content
| Element | Description |
|---------|-------------|
| Themes | Strategic focus areas |
| Initiatives | Major efforts |
| Features | Specific capabilities |
| Dependencies | Cross-functional needs |
| Milestones | Key dates |

## Roadmap Process

### Input Sources
| Source | Contribution |
|--------|--------------|
| Strategy | Business priorities |
| Customers | Needs and feedback |
| Market | Competitive intelligence |
| Technology | Innovation opportunities |
| Operations | Operational requirements |

### Prioritization Framework
| Factor | Weight |
|--------|--------|
| Customer value | 30% |
| Strategic alignment | 25% |
| Revenue potential | 20% |
| Effort required | 15% |
| Risk | 10% |

### Review Cadence
| Review | Frequency |
|--------|-----------|
| Team review | Weekly |
| Stakeholder review | Monthly |
| Leadership review | Quarterly |
| Strategic planning | Annually |

## Communication

| Audience | Content Level |
|----------|---------------|
| Executive | Strategic themes |
| Sales/Marketing | Customer-facing features |
| Engineering | Detailed requirements |
| Customers | Committed features only |

## Related Documents

- [Product Lifecycle](./Product_Lifecycle_Policy.md)
- [Strategy](../../Strategy/)
"""),
        ],
    },
}

def create_content(unit_name: str, content_type: str, files: list[tuple[str, str]]):
    """Create files for a unit."""
    unit_dir = UNITS_DIR / unit_name / content_type
    unit_dir.mkdir(parents=True, exist_ok=True)
    
    created = []
    for filename, content in files:
        file_path = unit_dir / filename
        if not file_path.exists():
            file_path.write_text(content)
            created.append(str(file_path.relative_to(UNITS_DIR)))
    
    return created

def main():
    total_created = 0
    
    for unit_name, content in UNIT_CONTENT.items():
        for content_type, files in content.items():
            created = create_content(unit_name, content_type, files)
            for f in created:
                print(f"✓ Created: {f}")
                total_created += 1
    
    print(f"\nTotal files created: {total_created}")

if __name__ == "__main__":
    main()
