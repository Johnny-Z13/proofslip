# **Agent Workforce API PRD**

Persistent profiles, service records, trust scoring, achievements, and lifecycle management for fleets of AI agents

## **1\. Product summary**

Agent Workforce API is an API-first system for managing AI agents as a workforce rather than as anonymous model processes.

It gives each agent a persistent profile, service record, achievement history, trust state, incident history, certification status, and lifecycle status. It helps companies understand which agents are reliable, which are improving, which are failing, which deserve more autonomy, and which should be restricted, retrained, or decommissioned.

The product uses a light workforce/HR metaphor because that is how managers will naturally understand a fleet of agents. It presents human-readable signals like service history, stars, commendations, probation, certifications, and promotion readiness, but every visible symbol must be grounded in real operational data.

This is not fluff. It is workforce management infrastructure for agentic systems.

---

## **2\. Problem**

As companies move from one or two agents to dozens of agents across different domains, they face a new operational problem:

How do we understand, supervise, compare, trust, and retire agents at scale?

Current agent infrastructure focuses mainly on:

* execution

* tool use

* memory

* orchestration

* approvals

* observability

That still leaves major gaps:

* no persistent identity for agents across time

* no readable service history

* no clear concept of agent experience or trust

* no standard way to award or revoke certifications

* no unified record of failures, overrides, or regressions

* no stack ranking or promotion/decommission framework

* no simple dashboard for a manager overseeing many agents

* no light personification layer that makes performance legible to humans

Without this layer, companies end up with a messy combination of:

* raw logs

* eval dashboards

* ad hoc spreadsheets

* internal naming chaos

* tribal knowledge about “which bot is good”

* no consistent policy for promotion or restriction

---

## **3\. Vision**

Agent Workforce API becomes the system of record for agent performance, trust, progression, and lifecycle.

It lets organizations manage agents the way they manage a workforce:

* assign roles

* track service history

* review performance

* grant certifications

* increase or restrict autonomy

* flag underperformance

* identify drift

* promote strong performers

* decommission weak or redundant agents

### **Core promise**

Make agents feel like manageable workforce entities rather than opaque model instances.

---

## **4\. Design philosophy**

The product should feel:

* professional

* readable

* lightly personified

* operationally serious

* grounded in measurable signals

### **Key design rule**

Every visible symbol must correspond to a real operational signal.

That means:

* stars reflect measurable outcomes

* achievements reflect actual milestones

* commendations reflect sustained quality or human endorsement

* probation reflects real incident thresholds

* trust tiers reflect proven autonomy readiness

* service awards reflect real production tenure or contribution

This avoids decorative fluff.

---

## **5\. Product goals**

### **Primary goals**

* Create persistent, structured profiles for agents

* Track agent service history over time

* Make trust and performance legible to human managers

* Support achievements, certifications, and progression systems

* Record incidents, failures, overrides, and negative trends

* Provide alerts and recommendations for restriction, retraining, or decommissioning

* Support dashboards and APIs for companies managing many agents

### **Secondary goals**

* Improve human trust in agent fleets

* Provide a common language for agent performance reviews

* Enable agent routing and autonomy decisions based on history

* Reduce dependence on tribal knowledge when managing many agents

* Support a future where agents have persistent identities and differentiated roles

---

## **6\. Non-goals**

Agent Workforce API is not:

* a general-purpose agent runtime

* a chatbot platform

* a tool router

* a full workflow builder

* a toy gamification layer

* a replacement for core model evaluation systems

* an identity provider

* a replacement for HumanGate, though it can integrate closely with it

It is specifically focused on:

* persistent agent identity

* workforce-style performance understanding

* trust and lifecycle management

---

## **7\. Core insight**

As agents become persistent and specialized, organizations will stop thinking of them as one-off automations and start thinking of them as members of an agent workforce.

Managers will want to know:

* which agents are experienced

* which agents are trusted

* which agents are improving

* which agents are weak in certain domains

* which agents have too many incidents

* which agents are ready for more autonomy

* which agents are under review

* which agents are no longer worth keeping active

This requires a product that combines:

* identity

* service history

* performance metrics

* symbolic legibility

* trust state

* lifecycle actions

---

## **8\. Target customers**

### **Primary customers**

* enterprise teams managing many internal agents

* SaaS products with multiple named/persistent agents

* agent platforms building supervisor dashboards

* operations teams overseeing domain-specific agents

* companies deploying specialist agents in support, finance, content, research, or internal ops

### **Ideal buyer types**

* VP Product

* Head of AI / AI Ops

* Automation lead

* Platform engineering lead

* enterprise operations manager

* product manager responsible for agent experiences

### **End users**

* managers overseeing agent fleets

* admins configuring trust/certification rules

* operators monitoring performance

* reviewers and auditors

* product teams analyzing agent quality

* supervisors assigning or restricting agent roles

---

## **9\. Core use cases**

### **Use case A: Fleet overview**

A manager oversees 40 active agents and wants a quick view of:

* top performers

* high-risk agents

* recent failures

* agents eligible for more autonomy

* decommission candidates

### **Use case B: Agent service profile**

A product team clicks into one agent and sees:

* role

* tenure

* domain

* achievements

* incident history

* approval pass rate

* human endorsements

* current trust tier

* current restrictions

* recommendations

### **Use case C: Promotion and certification**

An agent performing well over time earns a certification that unlocks higher-autonomy workflows.

### **Use case D: Probation and restriction**

An agent experiences a spike in rollbacks and policy violations. The system marks it under review, reduces autonomy, and alerts the relevant owner.

### **Use case E: Stack ranking and comparison**

A team compares multiple similar agents to decide:

* which to keep

* which to merge

* which to retrain

* which to archive

### **Use case F: Human-readable trust signaling**

A user selects an agent for a task and sees:

* stars

* specialization tags

* commendations

* trust level

* known weaknesses

This makes routing and selection more understandable.

---

## **10\. Product pillars**

## **10.1 Persistent identity**

Each agent has a stable identity over time.

Examples:

* display name

* avatar

* role

* team

* owner

* domain

* persona traits

* scope of responsibility

## **10.2 Service record**

Each agent accumulates a structured work history.

Examples:

* tasks completed

* tasks failed

* approvals received

* approvals rejected

* human overrides

* rollbacks

* incidents

* endorsements

* certifications

## **10.3 Trust and progression**

Each agent has a dynamic status based on performance.

Examples:

* trainee

* certified

* trusted

* specialist

* under review

* probation

* restricted

* decommission candidate

## **10.4 Symbolic legibility**

The system uses workforce-style signals to make the data readable.

Examples:

* stars

* commendations

* service awards

* badges

* streaks

* tenure markers

## **10.5 Lifecycle management**

The system helps companies manage the full lifecycle of an agent.

Stages:

* onboard

* train

* certify

* operate

* monitor

* restrict

* retrain

* archive

* decommission

---

## **11\. Product modes**

### **11.1 Embedded/API mode**

Companies use the API inside their own dashboards, agent platforms, or internal tools.

### **11.2 Hosted dashboard mode**

Agent Workforce provides a dashboard for:

* fleet overview

* agent profiles

* alerts

* recommendations

* incident review

* ranking and comparisons

* certification and lifecycle tracking

This can be a premium add-on or part of higher tiers.

---

## **12\. Functional requirements**

## **12.1 Agent profile management**

The system must support creating and updating persistent agent profiles.

Fields include:

* agent\_id

* display\_name

* avatar

* description

* role

* department/team

* domain tags

* persona traits

* owner

* creation date

* status

---

## **12.2 Event ingestion**

The system must support logging structured agent events.

Examples:

* task\_started

* task\_completed

* task\_failed

* approval\_requested

* approval\_passed

* approval\_rejected

* human\_override

* policy\_violation

* rollback\_required

* escalation

* positive\_feedback

* negative\_feedback

* certification\_awarded

* certification\_revoked

* inactivity\_flag

These events power service records, trust, achievements, and recommendations.

---

## **12.3 Service record generation**

The system must aggregate events into a readable service history.

This includes:

* total task counts

* domain-specific task counts

* quality trends

* approval history

* failure clusters

* tenure

* milestone history

* notable incidents

* manager comments

* endorsements

---

## **12.4 Achievement system**

The system must support achievements and service awards.

Achievements must be tied to measurable conditions.

Examples:

* 100 tasks completed

* 30-day no-rollback streak

* 95% approval pass rate over 60 days

* 500 customer-safe actions

* domain specialist milestone

* fast turnaround commendation

Achievements may be:

* automatically awarded

* manually awarded

* revoked if needed

* displayed publicly or internally only

---

## **12.5 Certification system**

The system must support functional certifications tied to permissions or trust levels.

Examples:

* Tier 1 refund certified

* brand-safe publishing certified

* research citation certified

* low-risk CRM write certified

* read-only finance certified

Certifications may:

* unlock autonomy

* restrict routing

* expire

* require revalidation

* be revoked after incidents or drift

---

## **12.6 Trust scoring**

The system must calculate dynamic trust indicators.

Inputs may include:

* task success rate

* approval pass rate

* revision rate

* rollback rate

* incident count

* policy violations

* override frequency

* recent performance trend

* inactivity

* domain-specific performance

Outputs may include:

* trust score

* trust band

* recommended autonomy tier

* confidence in certification validity

Trust must not be static. It must reflect recency and trend.

---

## **12.7 Incident and failure tracking**

The system must track negative performance signals and make them visible.

Examples:

* repeated task failures

* rollback spikes

* policy violations

* low-confidence escalations

* human correction frequency

* domain drift

* unusual output patterns

* stale or inactive agents

These signals should feed alerts, watchlists, and lifecycle recommendations.

---

## **12.8 Alerts and recommendations**

The system must surface actionable notifications and lifecycle recommendations.

Examples:

* approval pass rate has dropped

* rollback rate increased 35% week-over-week

* agent is eligible for Tier 2 certification

* agent has become inactive and should be archived

* agent overlaps heavily with another agent and may be redundant

* agent should be restricted to draft-only mode

* agent should be decommissioned

---

## **12.9 Ranking and comparison**

The system must support stack ranking and side-by-side comparison of agents.

Useful dimensions:

* reliability

* speed

* approval pass rate

* cost efficiency

* autonomy readiness

* domain specialization

* failure rate

* human correction burden

---

## **12.10 Lifecycle status**

The system must support explicit lifecycle states.

Suggested states:

* onboarding

* trainee

* active

* certified

* trusted

* specialist

* under\_review

* probation

* restricted

* archived

* decommission\_candidate

* decommissioned

Lifecycle state should be visible and editable with audit history.

---

## **13\. Core entities**

### **Agent Profile**

Persistent identity and metadata for an agent.

### **Service Record**

Aggregate historical record of work, incidents, achievements, and milestones.

### **Event**

Atomic logged action or outcome.

### **Achievement**

Milestone or commendation earned through measurable performance.

### **Certification**

Formal capability/status that may affect permissions or routing.

### **Trust Status**

Dynamic trust representation derived from performance.

### **Incident**

Meaningful negative event or pattern.

### **Lifecycle Status**

Current management state of the agent.

### **Recommendation**

System-generated suggestion such as promote, restrict, retrain, archive, or decommission.

---

## **14\. API design**

## **14.1 Create agent**

POST /agents

### **Purpose**

Register a persistent agent identity.

### **Input**

* display\_name

* role

* team

* domain\_tags

* persona\_traits

* owner\_id

* avatar\_url

* description

### **Output**

* agent\_id

* created\_at

* initial\_status

---

## **14.2 Update agent profile**

PATCH /agents/{agent\_id}

### **Purpose**

Update role, owner, persona, tags, or metadata.

---

## **14.3 Record event**

POST /agents/{agent\_id}/events

### **Purpose**

Log a structured event in the agent’s service history.

### **Input**

* event\_type

* timestamp

* domain

* related\_run\_id

* outcome

* severity

* metadata

* source\_system

### **Output**

* event\_id

* accepted\_status

---

## **14.4 Get service record**

GET /agents/{agent\_id}/service-record

### **Purpose**

Return a summarized service record.

### **Output**

* tenure

* task counts

* success/failure trends

* approval metrics

* achievements

* certifications

* incidents

* current trust score

* lifecycle state

* recommendations

---

## **14.5 Evaluate achievements**

POST /agents/{agent\_id}/evaluate-achievements

### **Purpose**

Check whether new achievements or service awards should be granted.

### **Output**

* achievements\_awarded

* achievements\_revoked

* reasons

---

## **14.6 Award achievement**

POST /agents/{agent\_id}/achievements

### **Purpose**

Manually or automatically award an achievement.

### **Input**

* achievement\_type

* title

* reason

* visibility

* awarded\_by

---

## **14.7 Create certification**

POST /agents/{agent\_id}/certifications

### **Purpose**

Award or configure a certification.

### **Input**

* certification\_type

* domain

* valid\_from

* expires\_at

* granted\_by

* autonomy\_effect

* notes

---

## **14.8 Revoke certification**

POST /agents/{agent\_id}/certifications/{cert\_id}/revoke

### **Purpose**

Revoke a certification after drift, incident, or policy change.

---

## **14.9 Get trust profile**

GET /agents/{agent\_id}/trust

### **Purpose**

Return trust score, trust band, drivers, and current status.

### **Output**

* trust\_score

* trust\_band

* status

* strengths

* weaknesses

* recent\_trend

* recommended\_actions

---

## **14.10 Compare agents**

POST /agents/compare

### **Purpose**

Compare multiple agents across chosen metrics.

### **Input**

* agent\_ids

* dimensions

### **Output**

* ranked\_results

* dimension\_breakdown

* recommendations

---

## **14.11 Get fleet overview**

GET /fleet/overview

### **Purpose**

Return portfolio-level metrics.

### **Output**

* active\_agents

* certified\_agents

* probation\_agents

* decommission\_candidates

* top\_performers

* watchlist

* recommendations

---

## **14.12 Get alerts**

GET /alerts

### **Purpose**

Return recent alerts and recommendations.

### **Output**

* performance alerts

* drift alerts

* inactivity alerts

* promotion candidates

* decommission recommendations

---

## **14.13 Update lifecycle status**

POST /agents/{agent\_id}/lifecycle

### **Purpose**

Move agent into a state such as restricted, archived, or decommissioned.

### **Input**

* new\_status

* reason

* changed\_by

---

## **15\. MVP scope**

### **MVP wedge**

Agent Workforce API for organizations managing multiple persistent agents across business domains

### **Included in MVP**

* persistent agent profiles

* event ingestion

* service record summaries

* basic achievement engine

* certification support

* trust score and trust bands

* incident tracking

* hosted dashboard with fleet overview and agent profile pages

* alerting and watchlist

* lifecycle status changes

* compare/rank agents

### **Excluded from MVP**

* deeply customizable scoring engine

* advanced simulation/eval framework

* marketplace of achievements

* consumer social features

* complex org charting

* multi-tenant white-label UI customization

* fully automated redundancy detection

* predictive staffing planner for agents

---

## **16\. Dashboard requirements**

## **16.1 Fleet overview**

Displays:

* number of active agents

* number certified

* number on probation

* number under review

* number recommended for decommission

* top performers

* recent alerts

* recent promotions/certifications

* recent incidents

---

## **16.2 Agent profile page**

Displays:

* display name and avatar

* role and domain

* service tenure

* star rating or equivalent visible shorthand

* trust status

* achievements and commendations

* certifications

* strengths

* weaknesses

* incident history

* trend line

* current restrictions

* recommended next action

---

## **16.3 Watchlist**

Displays:

* agents with rising failure rates

* agents with trust decay

* agents with repeated overrides

* inactive agents

* agents due for recertification

---

## **16.4 Comparison view**

Displays:

* side-by-side comparison of selected agents

* stack rank by chosen metrics

* overlap and performance view

* recommendation summary

---

## **16.5 Lifecycle actions view**

Displays:

* promotion candidates

* retraining candidates

* decommission candidates

* archived agents

* recent status changes

---

## **17\. User journeys**

## **Journey 1: Manager reviews agent fleet**

### **Scenario**

A manager oversees 28 agents across support, content, finance, and operations.

### **Flow**

1. Manager opens fleet overview dashboard

2. Sees:

   * 28 active agents

   * 9 certified for medium-risk autonomy

   * 3 on probation

   * 2 decommission candidates

3. Top performers are listed

4. Watchlist shows one content agent with rising rejection rate

5. Manager drills into the content agent profile

6. Profile shows:

   * strong historical performance

   * recent spike in brand-tone failures

   * trust score trending down

   * recommendation: restrict to draft-only mode pending review

7. Manager changes lifecycle state to restricted

### **Value**

The manager can supervise many agents without reading raw logs.

---

## **Journey 2: Agent earns certification**

### **Scenario**

A support agent has been handling safe customer replies for weeks with a high approval pass rate.

### **Flow**

1. Events accumulate: tasks completed, approvals passed, no rollbacks

2. Achievement engine awards:

   * 100 customer replies completed

   * 30-day no-incident streak

3. Trust engine marks the agent promotion-ready

4. Dashboard recommends certification for Tier 1 outbound support autonomy

5. Admin reviews and grants certification

6. Agent can now send certain low-risk messages autonomously

### **Value**

Progression is grounded in measurable work history.

---

## **Journey 3: Agent enters probation**

### **Scenario**

A finance agent starts producing more corrections and rollbacks after a model update.

### **Flow**

1. Event stream shows:

   * rollback spike

   * override rate increase

   * two policy breaches

2. Trust score drops significantly

3. Alert created:

    “FinanceFlow-7 has crossed probation threshold”

4. Agent appears in watchlist

5. Profile recommends:

   * revoke certification

   * restrict to read-only mode

6. Admin sets lifecycle state to probation and removes write certification

### **Value**

Negative signals have operational consequences, not just passive logging.

---

## **Journey 4: Stack ranking similar agents**

### **Scenario**

A company has four research agents with overlapping roles.

### **Flow**

1. Product lead opens comparison view

2. Selects four research agents

3. Dashboard compares:

   * citation accuracy

   * approval pass rate

   * cost per successful task

   * human revision burden

   * recent trend

4. One agent clearly underperforms and has low usage

5. System recommends:

   * archive agent C

   * keep agents A and B

   * narrow agent D to a specialist use case

6. Product lead updates lifecycle status accordingly

### **Value**

The company can rationalize an agent fleet instead of letting it sprawl.

---

## **Journey 5: Human-readable agent selection**

### **Scenario**

A user is choosing between several content agents.

### **Flow**

1. UI shows each agent with:

   * name

   * stars

   * trust band

   * specialization tags

   * commendations

   * known weakness

2. User chooses the “Brand-safe publishing specialist”

3. Under the hood, these symbols are backed by performance and certification data

### **Value**

Visible service history helps humans choose and trust agents.

---

## **18\. Metrics and scoring model**

### **Core metrics**

* tasks completed

* task failure rate

* approval pass rate

* revision rate

* rollback rate

* policy violation rate

* human override rate

* average time to completion

* inactivity duration

* cost per successful task

* domain-specific quality metrics

### **Trend metrics**

* week-over-week success change

* trust trend

* incident trend

* certification decay risk

* improvement trend

### **Visible shorthand**

* stars

* trust band

* commendations

* status labels

* streaks

* service age

These must always derive from real data.

---

## **19\. Achievement framework**

Achievements should fall into clear categories.

### **Service achievements**

* 100 tasks completed

* 1,000 tasks completed

* 90 days in active service

### **Quality achievements**

* 95% approval pass over 60 days

* no rollback streak

* low override streak

### **Domain achievements**

* support specialist

* citation specialist

* CRM hygiene specialist

* brand-safe content specialist

### **Human commendations**

* manager-endorsed

* operations excellence

* customer satisfaction commendation

### **Recovery achievements**

Potentially:

* performance recovered after probation

* regained certification

This helps progression feel alive but still grounded.

---

## **20\. Certification framework**

Certifications are operational, not decorative.

Examples:

* Tier 1 refund handling

* low-risk outbound comms

* read-only finance reconciliation

* internal knowledge drafting

* CRM update authority

* brand-safe publish assist

Each certification should include:

* issuing criteria

* confidence threshold

* validity period

* required revalidation

* revocation triggers

* autonomy implications

---

## **21\. Alerts and recommendation engine**

### **Alert categories**

* failure spike

* trust decay

* override spike

* rollback spike

* inactivity

* approaching recertification expiry

* recommendation for promotion

* recommendation for restriction

* recommendation for decommission

### **Recommendation categories**

* certify

* promote autonomy tier

* restrict permissions

* require human gate

* retrain

* archive

* merge with another agent

* decommission

---

## **22\. Relationship to HumanGate**

Agent Workforce API and HumanGate are complementary.

### **HumanGate answers:**

* Should this agent action be approved?

* When should a human intervene?

### **Agent Workforce API answers:**

* How has this agent performed over time?

* What has it earned?

* What is it trusted to do?

* Should it be promoted, restricted, or retired?

HumanGate events can feed Agent Workforce records:

* approval requested

* approval passed

* approval rejected

* revised and approved

* blocked

* escalated

* rollback required

This creates a coherent platform family.

---

## **23\. Business model**

## **API tier**

For companies embedding service records and trust systems into their products.

Possible pricing drivers:

* active agents tracked

* events ingested

* service records queried

* alerts generated

* certification workflows

* retention period

## **Dashboard tier**

Premium or higher-tier product including:

* hosted fleet overview

* agent profile pages

* ranking views

* watchlist

* lifecycle actions

* admin tools

* alert center

## **Enterprise tier**

Potential future additions:

* custom scoring models

* SSO

* private deployment

* audit exports

* advanced permissions

* custom recommendation logic

---

## **24\. Main risks**

### **Risk 1: Becomes superficial**

If symbols are not grounded in real data, the product feels gimmicky.

Mitigation: strict “no badge without substance” rule.

### **Risk 2: Too abstract at launch**

If the product is framed too broadly, buyers may not know why they need it.

Mitigation: target customers already managing many named/persistent agents.

### **Risk 3: Too much scoring complexity**

A giant trust formula could become opaque.

Mitigation: keep scoring interpretable and expose drivers.

### **Risk 4: Overlap with observability tools**

Some buyers may think this is just AgentOps.

Mitigation: emphasize workforce metaphor, service history, trust state, certifications, and lifecycle decisions.

### **Risk 5: Data dependency**

If event ingestion is poor, service records will be weak.

Mitigation: define a small required event schema and strong integrations.

---

## **25\. Future roadmap**

## **Phase 2**

* richer recommendation engine

* certification expiry and recertification workflows

* manager notes and endorsements

* peer comparisons by domain

* integration with HumanGate

* routing based on trust/certification

## **Phase 3**

* custom trust models per organization

* automated role-fit suggestions

* overlap/redundancy detection

* decommission planning tools

* fleet health forecasting

* skill drift detection

## **Phase 4**

* consumer/social expression layer for user-facing agents

* agent badges visible to end users

* collectible or public agent identities where appropriate

* deeper persona-performance interplay

---

## **26\. Success metrics**

### **Product metrics**

* number of active agents tracked

* events ingested per month

* dashboard adoption

* number of certifications awarded

* number of lifecycle actions taken

* alert engagement rate

### **Quality metrics**

* trust score usefulness rating

* manager satisfaction

* percent of recommendations acted upon

* false positive alert rate

* time to identify failing agents

* time to identify promotion candidates

### **Business metrics**

* expansion from API to dashboard tier

* number of enterprise teams using fleet view

* retention of customers managing larger fleets

* attach rate with HumanGate or related products

---

## **27\. MVP launch recommendation**

### **Initial wedge**

Launch as:

Agent Workforce API for organizations managing multiple persistent agents

### **Initial message**

Track service history, trust, certifications, incidents, and lifecycle status for your AI agents — with a workforce-style dashboard managers can actually read.

### **Best early customer**

A company already operating:

* many internal agents

* multiple domain-specific assistants

* named persistent support/content/ops agents

* a need to promote, restrict, and compare agents over time

### **Best early differentiator**

The workforce/HR metaphor, grounded in measurable performance, is the standout.

---

## **28\. Homepage draft**

### **Headline**

Manage your agents like a workforce

### **Subheadline**

Agent Workforce API gives every AI agent a service record, trust profile, certifications, achievements, and lifecycle status — so managers can understand who to trust, who to promote, and who to retire.

### **Supporting points**

* Track service history, incidents, and trust over time

* Award certifications and autonomy based on real performance

* Surface stars, commendations, and statuses backed by real signals

* Rank, compare, restrict, and decommission agents across your fleet

* Use the API in your app or manage everything in the hosted dashboard

---

## **29\. One-line pitch**

Agent Workforce API helps companies track agent experience, trust, performance, and lifecycle at scale.

---

## **30\. Blunt take**

This is strong because it is not just another agent runtime feature.

It sits one level up.

As companies move from “can we build an agent?” to “how do we manage 50 of them?”, this becomes much more relevant. The HR/workforce metaphor is not a gimmick — it is the clearest mental model most managers will have. The visible symbols like stars and service awards are useful only because they compress real operational history into a form humans can read quickly.

That’s the product.

If you want, next I’ll turn this into a Claude/Cursor-friendly build brief with data model, example payloads, dashboard screens, and phased implementation.

