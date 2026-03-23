# **ProofSlip API PRD**

24-hour live receipts for agent workflows, with optional saved and archive tiers

## **1\. Product summary**

ProofSlip API is a simple infrastructure API for issuing short-lived, machine-readable receipts that help agents verify what just happened, what was approved, what was allowed, and whether it is safe to continue.

By default, receipts are ephemeral and expire after 24 hours. This keeps the product lightweight, cheap to run, easy to adopt, and less burdened by long-term storage and legal/compliance overhead.

The core idea is:

Agents should not continue based on assumptions when they can continue based on receipts.

Receipts act as compact trust and state objects for active workflows. Agents can create, fetch, and query them to verify context before continuing.

Longer retention, starring/saving, search history, signed receipts, and archive functionality are available only in higher tiers.

---

## **2\. Problem**

Agentic workflows are messy in very predictable ways.

Agents frequently face questions like:

* did this action already happen?

* was the request approved?

* what constraints were attached to that approval?

* what scopes were granted in this session?

* was the last step successful, partial, or failed?

* is retry safe?

* should I continue, wait, or escalate?

* has something changed since the last step?

Most teams currently solve this badly using:

* raw logs

* ad hoc database rows

* brittle workflow flags

* spreadsheet tracking

* custom status tables

* hand-rolled retry logic

* ambiguous tool responses

This creates problems such as:

* duplicate side effects

* accidental repeated actions

* unclear resumability

* weak approval state visibility

* fragile integrations

* excessive debugging effort

* bloated “just in case” logging systems

The full enterprise/audit solution is heavy and overkill for many early agent workflows. What is missing is a lightweight, short-lived, operational receipt layer.

---

## **3\. Vision**

ProofSlip API becomes the lightweight transactional memory layer for agents.

It gives developers and products a clean way to issue short-lived receipts around:

* actions

* approvals

* handshakes

* permissions

* failures

* resumable state

These receipts are:

* machine-readable

* human-readable

* queryable

* short-lived by default

* easy to create and fetch

* useful for retry safety, continuation logic, and context verification

### **Core promise**

Create receipts for what just happened, let agents check them before continuing, and delete them after 24 hours unless explicitly saved.

---

## **4\. Product philosophy**

The product should feel:

* simple

* sharp

* lightweight

* operational

* ephemeral by default

The product should not feel like:

* an observability monster

* a compliance platform

* permanent logging infrastructure

* another enterprise archive product on day one

### **Key design principle**

Most receipts are live workflow artifacts, not permanent records.

This is the core wedge.

---

## **5\. Why ephemerality is a feature**

The 24-hour default retention is not a limitation. It is central to the product strategy.

### **Benefits**

* lower storage costs

* simpler legal/compliance posture for MVP

* easier to adopt in prototypes and vibe-coded apps

* lighter developer mental model

* stronger focus on active workflows instead of audit bloat

* easier pricing ladder to premium retention tiers

### **Product analogy**

This is closer to Snapchat for agent workflow receipts than to enterprise recordkeeping software.

Most receipts should disappear unless the customer intentionally saves them.

---

## **6\. Product goals**

### **Primary goals**

* Give agents a clean object to check before continuing

* Reduce ambiguity around last-step state

* Prevent duplicate actions and retries with side effects

* Support approvals, handshakes, action verification, and resumability

* Keep the default product lightweight via 24-hour retention

* Make the API easy enough to drop into fast-built apps and workflows

### **Secondary goals**

* Create a natural upsell path for saved and archived receipts

* Provide a clean hosted dashboard for receipt inspection on paid tiers

* Support lightweight human-readable and machine-readable receipt forms

* Enable downstream workflows through webhooks and receipt query APIs

---

## **7\. Non-goals**

ProofSlip API is not:

* a full audit/compliance system for MVP

* a general observability platform

* an agent runtime

* a workflow engine

* a full policy/approval platform

* a permanent event log for every customer

* a replacement for HumanGate or Agent Workforce, though it may integrate with both

This product is specifically about:

* short-lived receipts

* context verification

* workflow continuation safety

* premium saved/archive tiers for customers who need more

---

## **8\. Core use cases**

### **Use case A: Approval polling**

An agent requests approval and receives a receipt. It polls the receipt until status changes from pending to approved, rejected, or approved\_with\_constraints.

### **Use case B: Retry safety**

An agent attempts an external action, encounters a timeout, and checks the action receipt to determine whether the action already completed or whether retry is safe.

### **Use case C: Handshake verification**

An agent connects to a tool or remote server and checks the handshake receipt to confirm granted scopes and session validity before proceeding.

### **Use case D: Resume after interruption**

An agent pauses due to human review, expired session, or temporary failure. It later checks a resume receipt to determine allowed next steps.

### **Use case E: Short-lived transactional memory**

A vibe-coded internal tool uses receipts as a simple way for multiple agent steps to coordinate over a 24-hour window without building heavy workflow state infrastructure.

---

## **9\. Target users**

### **Primary users**

* developers building agent workflows

* startups shipping quick AI tools

* internal tools teams

* no-code / low-code builders with agent steps

* products using approvals, retries, or resumable actions

* vibe coders building fast-moving workflows

### **Secondary users**

* AI ops teams wanting a lightweight state artifact

* products that may later need durable receipts

* teams that may graduate into HumanGate or Agent Workforce later

### **Ideal early adopter profile**

A developer or product team saying:

“I just need my agent to know what happened in the last step without building a giant state machine.”

---

## **10\. Product modes and tiers**

## **10.1 Live receipts tier**

This is the default product and MVP wedge.

### **Characteristics**

* receipts expire automatically after 24 hours

* no durable archive by default

* designed for live workflow coordination

* low cost and low complexity

* ideal for experimentation and fast integration

### **Receipt states**

* live

* expired

* deleted

---

## **10.2 Saved receipts tier**

Premium functionality.

### **Characteristics**

* user can star/save selected receipts

* retention beyond 24 hours

* searchable history

* team access

* export functionality

* more useful for customer support, investigations, higher-value workflows

### **Receipt states**

* live

* saved

* expired

* deleted

---

## **10.3 Archive / pro tier**

For customers who need more serious retention.

### **Characteristics**

* long retention windows

* signed or tamper-evident receipts

* search, filters, exports

* dashboard history

* compliance-leaning use cases

* likely higher pricing and contract value

### **Receipt states**

* live

* saved

* archived

* expired

* deleted

---

## **11\. Receipt types**

MVP should stay focused on a small set of receipt types.

## **11.1 Action receipt**

Confirms:

* what action happened

* target entity/system

* success / partial / failed

* duplicate risk

* retry safety

* next-step hint

Example:

* email sent

* CRM updated

* document published

* file deleted

* refund issued

---

## **11.2 Approval receipt**

Confirms:

* approval pending / approved / rejected / revised

* who approved

* constraints attached

* expiry

* whether execution may continue

Example:

* approved with max refund of £50

* rejected pending manual escalation

* revised and resubmitted

---

## **11.3 Handshake receipt**

Confirms:

* what connected to what

* auth/scopes granted

* environment

* session validity

* success / fail / partial

Example:

* agent connected to CRM with read-only scope

* write scope denied

* session expires in 45 minutes

---

## **11.4 Resume receipt**

Confirms:

* where a paused workflow can resume

* dependencies still pending

* allowed next actions

* expiry

* resumability state

Example:

* wait for approval

* re-auth required

* safe to continue with reduced scope

---

## **11.5 Failure receipt**

Optional for MVP or early follow-up.

Confirms:

* failure category

* retry-safe or not

* likely next best action

* escalation hint

Example:

* network timeout, retry safe

* approval missing, retry not allowed

* action partially committed, duplicate risk high

---

## **12\. Functional requirements**

## **12.1 Create receipts**

The system must allow clients to create receipts with:

* type

* status

* linked identifiers

* payload

* expiry

* metadata

Each receipt must have:

* a stable receipt ID

* a creation timestamp

* a clear TTL

* a machine-readable structure

---

## **12.2 Fetch receipts**

The system must allow agents and systems to fetch a receipt by ID.

The response must clearly show:

* current state

* validity

* expiry

* linked workflow references

* recommended next-step hint where available

---

## **12.3 Query latest receipts**

The system must allow querying for the latest relevant receipt(s) by:

* run ID

* action ID

* agent ID

* workflow ID

* receipt type

* status

This supports agents that do not want to store specific receipt IDs everywhere.

---

## **12.4 Receipt updates**

Receipts must be updatable where appropriate, especially for:

* approval state changes

* partial success → success

* pending → expired

* resume dependency resolution

Receipt updates must preserve clear timestamps and versioning.

---

## **12.5 TTL expiry**

All live receipts must expire automatically after 24 hours by default unless:

* saved manually

* preserved by paid tier settings

* explicitly archived in supported plans

Expiry must be deterministic and visible in the API.

---

## **12.6 Save/star receipts**

Paid tiers must allow selected receipts to be saved before expiry.

Saving a receipt should:

* override default expiry behavior

* update receipt state

* preserve payload and metadata

* make it available in search/history

---

## **12.7 Webhook notifications**

The system should support webhook notifications for:

* receipt created

* receipt updated

* approval resolved

* receipt expiring soon

* receipt saved

* receipt expired

---

## **12.8 Human-readable summaries**

Receipts should include both:

* a machine-readable payload

* a concise human-readable summary

Human-readable summaries must remain lightweight and not require costly AI generation by default.

---

## **13\. Core entities**

### **Receipt**

The main object representing a workflow artifact.

### **Receipt Type**

The category: action, approval, handshake, resume, failure.

### **Receipt State**

The lifecycle state: live, saved, archived, expired, deleted.

### **Receipt Link**

Relationship to:

* agent

* run

* action

* session

* approval

* user

* external system

### **Receipt Version**

A timestamped version of the receipt after updates.

### **Receipt Artifact**

Optional attached blob or linked object for larger evidence or payloads.

---

## **14\. API design**

## **14.1 Create receipt**

POST /receipts

### **Purpose**

Create a new live receipt.

### **Input**

* receipt\_type

* run\_id

* agent\_id

* action\_id

* workflow\_id

* status

* payload

* human\_summary

* expires\_in

* metadata

### **Default behavior**

If no expiry is provided, receipt expires in 24 hours.

### **Output**

* receipt\_id

* receipt\_type

* state \= live

* created\_at

* expires\_at

* version

* status

---

## **14.2 Get receipt**

GET /receipts/{receipt\_id}

### **Purpose**

Fetch a single receipt.

### **Output**

* receipt\_id

* type

* state

* status

* payload

* human\_summary

* created\_at

* updated\_at

* expires\_at

* version

* linked\_entities

---

## **14.3 Query receipts**

POST /receipts/query

### **Purpose**

Fetch latest relevant receipt(s) for context verification.

### **Input**

* run\_id

* agent\_id

* action\_id

* workflow\_id

* receipt\_type

* latest\_only

* include\_expired

### **Output**

* matching receipts

* most recent receipt

* validity

* next-step hints where available

---

## **14.4 Update receipt**

PATCH /receipts/{receipt\_id}

### **Purpose**

Update status, payload fields, or metadata.

### **Example updates**

* approval pending → approved

* action partial → success

* constraints added

* retry\_safe false → true

### **Output**

* updated receipt

* new version

* updated\_at

---

## **14.5 Save receipt**

POST /receipts/{receipt\_id}/save

### **Purpose**

Promote a live receipt into saved state.

### **Availability**

Paid tiers only.

### **Output**

* receipt\_id

* state \= saved

* retention policy

* saved\_at

---

## **14.6 Archive receipt**

POST /receipts/{receipt\_id}/archive

### **Purpose**

Move a saved receipt into archive retention.

### **Availability**

Higher tiers only.

---

## **14.7 Delete receipt**

DELETE /receipts/{receipt\_id}

### **Purpose**

Explicitly delete a receipt before TTL expiry or retention expiry.

---

## **14.8 Register webhook**

POST /webhooks

### **Purpose**

Subscribe to receipt lifecycle events.

---

## **15\. Receipt object model**

A receipt should have a consistent top-level structure.

### **Core fields**

* receipt\_id

* receipt\_type

* state

* status

* agent\_id

* run\_id

* action\_id

* workflow\_id

* created\_at

* updated\_at

* expires\_at

* version

* human\_summary

* payload

* metadata

* linked\_entities

### **Example payload patterns**

#### **Approval receipt payload**

* approval\_status

* approver\_id

* constraints

* approved\_at

* expiry

#### **Action receipt payload**

* target\_system

* target\_entities

* result

* retry\_safe

* duplicate\_risk

* rollback\_available

#### **Handshake receipt payload**

* client

* server

* auth\_method

* granted\_scopes

* denied\_scopes

* session\_expires\_at

#### **Resume receipt payload**

* resumable

* pending\_dependencies

* next\_allowed\_actions

* requires\_reauth

---

## **16\. User journeys**

## **Journey 1: Approval polling in a vibe-coded app**

### **Scenario**

A small app has an agent that drafts outreach messages but needs human approval before sending.

### **Flow**

1. App creates an approval receipt with status pending

2. Agent polls the receipt every 30 seconds

3. Human approves in the app UI

4. Receipt updates to approved\_with\_constraints

5. Agent fetches the updated receipt

6. Receipt says:

   * approved \= true

   * remove 2 recipients

   * shorten message slightly

7. Agent proceeds safely

### **Value**

The developer gets simple approval coordination without building complex state infrastructure.

---

## **Journey 2: Retry after uncertain action result**

### **Scenario**

An agent attempts to send a refund request and receives a timeout.

### **Flow**

1. Action receipt is created when the attempt starts

2. Timeout occurs before the agent gets full confirmation

3. Agent queries latest action receipt by run and action ID

4. Receipt returns:

   * status \= partial\_success

   * duplicate\_risk \= high

   * retry\_safe \= false

   * next step \= check provider response manually or wait for callback

5. Agent does not retry blindly

### **Value**

Duplicate side effects are avoided.

---

## **Journey 3: Handshake verification before tool use**

### **Scenario**

An agent connects to a CRM tool before updating records.

### **Flow**

1. Tool connection creates handshake receipt

2. Receipt shows:

   * read scope granted

   * write scope denied

   * session expires in 20 minutes

3. Agent fetches receipt before planning next action

4. Agent adjusts plan to read-only mode

### **Value**

The workflow reacts to real permissions instead of assumptions.

---

## **Journey 4: Resume after interruption**

### **Scenario**

A workflow pauses when a manager leaves approval pending overnight.

### **Flow**

1. Resume receipt is created when workflow pauses

2. Next morning, agent fetches latest resume receipt

3. Receipt shows:

   * approval received at 08:15

   * action valid until 10:15

   * next allowed action \= execute payout with £50 cap

4. Agent resumes correctly

### **Value**

Resumability becomes explicit and simple.

---

## **Journey 5: Premium saved receipt**

### **Scenario**

A customer using the paid tier wants to keep one important approval/action chain.

### **Flow**

1. Receipt is still live within the 24-hour window

2. User clicks save/star in dashboard

3. Receipt state becomes saved

4. It no longer expires with the standard TTL

5. User can search, export, or reference it later

### **Value**

Customers only pay for durable memory when they actually need it.

---

## **17\. Idempotency and safe repeatability**

The system should support idempotency keys when creating receipts or linked actions.

### **Why this matters**

Agents often:

* retry

* resume

* get interrupted

* lose certainty about whether a side effect already happened

Receipts should help answer:

* did this action already happen?

* is retry safe?

* am I about to duplicate a side effect?

This is a core part of product value, especially for action receipts.

---

## **18\. Tech stack recommendation**

## **Backend**

* TypeScript / Node.js

* JSON-first API framework such as Fastify or similar

## **Database**

* Postgres as source of truth

* structured columns plus JSONB payloads

## **Optional cache/queue**

* Redis for hot reads and background jobs if needed

## **Object storage**

* S3-compatible storage only for larger artifacts

* keep default receipts compact and JSON-native

## **Frontend**

* Next.js / React for dashboard on paid tiers

## **Integrity approach**

* hashes / tamper-evident versioning first

* signatures later for higher tiers

### **Key architecture principle**

Keep receipts small, structured, and queryable.

Do not bloat MVP with giant payloads or expensive summarization.

---

## **19\. Storage and cost strategy**

The product should be designed so that the default 24-hour tier stays cheap and fast.

### **Cost centers**

* receipt storage

* read/query volume from polling

* webhook delivery

* saved/archive retention for paid tiers

* optional large artifacts

### **Cost control rules**

* default 24-hour TTL

* compact receipt payloads

* no heavy blob storage by default

* use object storage only for bigger linked artifacts

* support polling but encourage sensible intervals

* archive only for paid tiers

### **Storage model**

* live receipts in primary database

* saved receipts retained per paid tier

* archived receipts in cheaper storage class for pro customers

This keeps the MVP low-friction and avoids premature legal/storage burden.

---

## **20\. Dashboard requirements**

Dashboard should not be part of the MVP wedge, but should exist for paid tiers or later-stage adoption.

## **20.1 Live receipts view**

Displays:

* recent live receipts

* type

* status

* expiry countdown

* linked run/agent/action

* save/star action where allowed

## **20.2 Receipt detail view**

Displays:

* human summary

* payload

* lifecycle state

* expiry

* version history

* linked context

* save/archive action if available

## **20.3 Saved receipts view**

Displays:

* saved receipts

* filters

* search

* export options

## **20.4 Webhook/event view**

Displays:

* webhook delivery logs

* failures/retries

* receipt event history

---

## **21\. MVP scope**

### **MVP wedge**

24-hour live receipts for active agent workflows

### **Included in MVP**

* create receipt

* get receipt

* query latest receipt

* update receipt

* live TTL expiry after 24 hours

* action, approval, handshake, and resume receipt types

* compact human summary

* webhook support

* idempotency support for safe repeatability

### **Excluded from MVP**

* full dashboard-heavy product

* long-term archive by default

* complex analytics

* AI-generated summaries everywhere

* compliance-oriented retention promises

* huge artifact support

* advanced signing

* heavy policy/approval management

---

## **22\. Future roadmap**

## **Phase 2**

* save/star receipts

* hosted dashboard

* search/filter history for saved receipts

* archive tiers

* receipt export

* receipt signatures / tamper-evident proofs

## **Phase 3**

* richer failure receipts

* deeper HumanGate integration

* cross-run receipt graphing

* recommended next-step hints

* team workspaces

* retention policy controls

## **Phase 4**

* Agent Workforce integration

* trust-linked receipt scoring

* advanced policy traces

* enterprise retention and audit modules

---

## **23\. Business model**

## **Free / entry tier**

* 24-hour live receipts only

* limited volume

* no durable save

* API only

* ideal for prototypes, experiments, vibe-coded workflows

## **Paid / saved tier**

* save/star selected receipts

* longer retention

* dashboard access

* search and export

* webhook history

* team access

## **Pro / archive tier**

* archive receipts

* signed receipts

* longer retention windows

* advanced controls

* higher usage caps

* premium support

### **Commercial logic**

The on-ramp is cheap and viral.

Revenue comes from the moment the customer says:

“Actually, I need to keep this receipt.”

---

## **24\. Success metrics**

### **Product metrics**

* number of live receipts created

* number of receipt fetches/queries

* percentage of workflows using receipts more than once

* save/star conversion rate

* webhook subscription rate

* receipt type distribution

### **Quality metrics**

* reduction in duplicate side effects

* reduction in failed retries

* successful continuation after approval or resume

* agent read-before-act behavior adoption

* time-to-resolution in ambiguous workflows

### **Business metrics**

* free-to-paid conversion

* saved receipt usage

* archive tier attach rate

* active developer teams

* viral adoption in lightweight apps and internal tools

---

## **25\. Risks**

### **Risk 1: Seen as “just logging”**

If positioned poorly, the product could sound like generic log storage.

Mitigation: emphasize receipts as live context-verification objects agents read before continuing.

### **Risk 2: Polling overload**

If every agent polls too aggressively, read traffic may spike.

Mitigation: support efficient query patterns, versioning, sensible TTLs, and webhooks.

### **Risk 3: Too much retention pressure too early**

Customers may push for long retention immediately.

Mitigation: keep 24-hour live receipts as the core wedge and monetize saved/archive deliberately.

### **Risk 4: Too broad too early**

Too many receipt types could blur the product.

Mitigation: focus MVP on action, approval, handshake, and resume receipts.

### **Risk 5: Legal/compliance drag**

Long-term storage can create unnecessary complexity.

Mitigation: default ephemerality, paid retention only, no broad compliance promise at MVP.

---

## **26\. Positioning**

### **One-line pitch**

ProofSlip API gives agents short-lived receipts they can check before continuing — so workflows stay safe, resumable, and duplicate-free.

### **Homepage headline**

24-hour receipts for agent workflows

### **Subheadline**

Create live receipts for approvals, actions, handshakes, and resumable state. Let agents verify what happened before they continue. Save the important ones only if you need to.

### **Supporting points**

* prevent duplicate side effects

* verify approvals and constraints

* confirm granted scopes and sessions

* resume cleanly after interruptions

* default 24-hour retention keeps it simple and cheap

---

## **27\. Blunt product take**

This is strong because it is:

* simple

* timely

* infra-like

* lightweight

* highly usable in messy real-world agent flows

* naturally viral in fast-built apps and workflows

The 24-hour default is the wedge.

Saved and archive tiers are the revenue expansion.

The core product value is not storing history forever. It is helping agents continue safely right now.

That is the product.

