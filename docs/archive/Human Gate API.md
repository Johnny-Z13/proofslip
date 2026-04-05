# **HumanGate PRD**

Approval, escalation, and intervention infrastructure for agentic workflows

## **1\. Product summary**

HumanGate is an API-first approval and intervention layer for AI agents and agentic pipelines.

It helps companies decide when an agent can act autonomously, when it must pause, what evidence it should present, who should review the action, and how the workflow should resume after a decision.

HumanGate is designed for products and internal systems where agents can take meaningful actions such as sending messages, updating records, publishing content, approving spend, or deleting data.

The product has two modes:

1. Embedded/API mode

    Companies integrate HumanGate into their own apps, workflows, or agent pipelines.

2. Dashboard mode

    HumanGate provides a hosted review inbox, audit view, and approval management console.

    This can be bundled as a premium tier or separate subscription layer.

---

## **2\. Problem**

As agents become more capable, the issue is no longer only whether they can complete tasks. The issue is whether they should be trusted to complete specific actions without human intervention.

Teams building agentic systems face recurring problems:

* unclear rules for when an agent should pause

* inconsistent approval logic across products and teams

* poor review UX for human approvers

* weak audit trails

* alert fatigue from too many approval prompts

* lack of structured evidence for reviewers

* difficulty resuming agent workflows after approval or rejection

* no central control over policy across multiple agent systems

Without a dedicated approval layer, most teams end up building fragile logic such as:

* “if external email, ask manager”

* “if more than 10 records changed, pause”

* “if confidence below threshold, maybe escalate”

* “if delete action, log warning”

This becomes inconsistent, hard to maintain, and difficult to audit.

---

## **3\. Vision**

HumanGate becomes the control layer between agent intent and consequential action.

It acts as a neutral approval and escalation service that allows companies to:

* define gating rules once

* standardize human review experiences

* collect and package evidence consistently

* route requests to the right people

* preserve a full audit trail

* resume runs safely and predictably

### **Core promise**

Agents do the work. HumanGate decides when a human must step in, and makes that intervention fast, legible, and auditable.

---

## **4\. Product goals**

### **Primary goals**

* Provide a reliable API for evaluating whether an agent action should proceed, pause, escalate, or be blocked

* Generate clean approval packets from messy agent state

* Enable fast human review through embedded experiences or hosted dashboard access

* Resume workflows safely after approval decisions

* Maintain structured audit history across all gated actions

### **Secondary goals**

* Reduce engineering time spent building custom approval logic

* Reduce human review time through better summaries and previews

* Improve trust in agentic systems

* Support organization-wide policy control across multiple agent workflows

---

## **5\. Non-goals**

HumanGate is not:

* a general-purpose agent framework

* a replacement for LLM vendors or tool calling platforms

* a workflow builder for all automation use cases

* a compliance platform in its first version

* a full chatbot UI

* a generic ticketing or task management system

* a replacement for identity/access systems, though it may integrate with them

HumanGate focuses on approval, escalation, and human intervention around agent actions.

---

## **6\. Target users**

### **Primary customers**

* SaaS platforms building agent features

* enterprise internal tooling teams

* ops and automation teams deploying AI agents

* startups adding agentic actions into business software

* products where AI can take write actions or external actions

### **Example customer profiles**

* CRM vendor with AI that drafts and sends outreach

* support platform with refund or response agents

* finance workflow product with approval-requiring spend actions

* internal operations assistant that edits records and generates updates

* content platform with AI that can publish, schedule, or alter external-facing content

### **Human user types**

* managers approving actions

* operations staff reviewing medium-risk actions

* compliance/legal reviewers

* finance approvers

* administrators defining policy

* product and engineering teams auditing run history

---

## **7\. Core use cases**

### **Use case A: Outbound communication approval**

An agent drafts an email to a customer or prospect. HumanGate pauses before sending, shows the draft, explains the context, and asks the right reviewer to approve, edit, reject, or escalate.

### **Use case B: Record write approval**

An agent proposes changes to CRM, ERP, or internal records. HumanGate shows a before/after diff, number of records affected, reason for change, and rollback information.

### **Use case C: Spend/purchase approval**

An agent wants to order supplies, issue a refund, or create a purchase request. HumanGate routes the request to the correct budget owner with supporting context.

### **Use case D: Content publishing approval**

An agent prepares a blog post, social post, release note, or webpage edit. HumanGate packages the preview and supporting evidence, then routes for approval.

### **Use case E: Escalation on low confidence**

An agent gets conflicting tool outputs or low confidence. Even without a hard policy trigger, it escalates to a human with the uncertainty clearly summarized.

---

## **8\. Product modes**

## **8.1 Embedded/API mode**

HumanGate is used behind the scenes by customer products and internal systems.

### **Benefits**

* native to the customer’s workflow

* no need for the customer to build approval logic from scratch

* can be embedded into CRM, dashboard, internal admin panel, or workflow surface

* flexible UI ownership

### **Typical customer**

A product team wanting HumanGate’s policy engine, approval packet generation, and workflow state APIs.

---

## **8.2 Hosted dashboard mode**

HumanGate provides a hosted interface for companies that do not want to build their own approval UI.

### **Dashboard includes**

* approval inbox

* request detail views

* filters by status/risk/team

* audit history

* policy overview

* user/role management

* reviewer routing visibility

* analytics

### **Positioning**

This can be:

* included in higher tiers

* sold as a premium add-on

* offered as a starter route for customers before full embedding

This is commercially attractive because many customers will want API access first, but others will want a ready-made review interface.

---

## **9\. User experience principles**

### **1\. Summary first**

Reviewers should see a clear decision card, not raw logs.

### **2\. Fast approval for simple cases**

Low-risk actions should be understandable in seconds.

### **3\. Expand for detail**

Evidence, diffs, and audit detail should be available but not forced upfront.

### **4\. Preview before action**

Where possible, show the actual proposed output before approval.

### **5\. Role-appropriate views**

Managers, compliance staff, and technical admins may need different levels of detail.

### **6\. Resume cleanly**

After a decision, the agent should receive structured next-step instructions.

---

## **10\. Core entities**

### **Action Proposal**

The agent’s intended action.

Fields may include:

* action type

* target system

* target entities

* proposed payload

* confidence

* reversibility

* impact estimate

* evidence references

### **Approval Packet**

The review object presented to humans.

Includes:

* summary

* rationale

* reason for gating

* policy matched

* preview/diff

* evidence bundle

* recommended action

* urgency

* reviewer routing

### **Decision**

The human or system outcome.

Examples:

* approved

* rejected

* approved\_with\_constraints

* escalated

* needs\_revision

* blocked

### **Run State**

The broader workflow context.

Includes:

* run ID

* task context

* prior steps

* unresolved issues

* current status

* resumable checkpoint

### **Policy Rule**

Conditions that decide when an action is allowed, blocked, or routed for approval.

---

## **11\. Functional requirements**

## **11.1 Policy evaluation**

The system must evaluate a proposed action and determine:

* allow

* block

* approval\_required

* escalate

* needs\_more\_context

Evaluation should consider:

* action type

* target system

* org policy

* user role

* data sensitivity

* confidence

* cost/spend

* reversibility

* number of entities affected

* external vs internal action

---

## **11.2 Approval packet generation**

The system must create a structured review object from the proposed action and workflow context.

Required elements:

* action summary

* reason for action

* reason approval is needed

* risk and confidence indicators

* evidence summary

* preview or diff where relevant

* recommended reviewer(s)

---

## **11.3 Human review actions**

The system must support:

* approve

* reject

* approve with edits

* approve with constraints

* request revision

* escalate

* request more info

---

## **11.4 Resume and continuation**

After a decision, the system must allow the workflow to resume with structured instructions.

Examples:

* approved with recipient exclusions

* approved with lower refund amount

* rejected and reroute to human operator

* revise tone and resubmit for approval

---

## **11.5 Audit and history**

The system must preserve:

* what the agent proposed

* what policy was triggered

* what evidence was shown

* who reviewed

* what decision was made

* what happened next

---

## **11.6 Hosted dashboard**

The hosted dashboard must support:

* pending approval inbox

* approval detail page

* reviewer actions

* audit trail lookup

* policy summaries

* role/user configuration

* filtering and search

---

## **12\. Suggested MVP scope**

### **MVP wedge**

HumanGate for agent write actions and outbound actions

This is the cleanest initial scope.

### **Included in MVP**

* policy evaluation

* approval packet generation

* hosted approval inbox

* approval detail page

* approve/reject/escalate/revise decisions

* resume API

* audit log

* webhook notifications

* basic roles and routing

* support for preview and diff attachments

### **Excluded from MVP**

* advanced rule builder UI

* complex compliance automation

* deep analytics

* marketplace of policy templates

* full Slack/Teams interactive UI on day one

* multi-region enterprise deployment

* extensive no-code workflow builder

* automatic policy generation from documents

---

## **13\. API design**

Below is a precise but lightweight endpoint model.

## **13.1 Evaluate step**

POST /evaluate-step

### **Purpose**

Evaluate whether an agent action can proceed.

### **Input**

* run\_id

* org\_id

* actor\_type

* action\_type

* target\_system

* target\_entities

* confidence\_score

* reversibility

* sensitivity\_level

* estimated\_impact

* evidence

* proposed\_payload

* context\_summary

### **Output**

* decision: allow | block | approval\_required | escalate

* reason\_codes

* policy\_id

* required\_reviewer\_type

* approval\_packet\_id (if needed)

* next\_action\_hint

---

## **13.2 Create approval**

POST /create-approval

### **Purpose**

Create a structured approval request manually or from an evaluate response.

### **Input**

* run\_id

* action\_summary

* why\_now

* why\_gated

* preview

* diff

* evidence\_bundle

* risk\_level

* confidence\_score

* recommended\_action

* reviewer\_rules

* urgency

### **Output**

* approval\_id

* status: pending

* reviewer\_route

* approval\_url

* created\_at

---

## **13.3 Resolve approval**

POST /resolve-approval

### **Purpose**

Submit a human decision.

### **Input**

* approval\_id

* reviewer\_id

* decision

* comment

* edits

* constraints

* escalation\_target

### **Output**

* status

* decision\_record\_id

* resume\_token

* next\_step

---

## **13.4 Resume run**

POST /resume-run

### **Purpose**

Resume the agent workflow using the decision result.

### **Input**

* run\_id

* approval\_id

* resume\_token

### **Output**

* permitted\_actions

* constraints

* updated\_context

* next\_status

---

## **13.5 Audit log**

GET /audit-log/{run\_id}

### **Purpose**

Return traceable history of the gated action(s).

### **Output**

* full approval chain

* timestamps

* decisions

* reviewers

* evidence references

* action outcomes

---

## **13.6 Webhook registration**

POST /webhooks

### **Purpose**

Register event notifications.

### **Event examples**

* approval.created

* approval.pending

* approval.resolved

* approval.escalated

* run.resumable

* policy.blocked

---

## **14\. Dashboard requirements**

## **14.1 Approval inbox**

Shows:

* pending requests

* priority

* risk

* requester agent/system

* target system

* due time

* assigned reviewer

* status

Filters:

* by status

* by team

* by action type

* by urgency

* by policy

* by confidence/risk band

---

## **14.2 Approval detail screen**

Shows:

* action summary

* why approval is needed

* what the agent wants to do

* preview/diff

* evidence summary

* raw evidence expandable

* confidence/risk

* audit context

* buttons:

  * approve

  * reject

  * edit then approve

  * approve with constraints

  * escalate

  * request revision

---

## **14.3 Audit screen**

Shows:

* timeline of events

* proposals and decisions

* reviewer actions

* policy references

* related runs

* outcome status

---

## **14.4 Policy overview**

Shows:

* active policy rules

* most-triggered rules

* block/approval rates

* misfire or noisy rules

* reviewer load

MVP version can be read-only and simple.

---

## **15\. User journeys**

## **Journey 1: Embedded approval in a SaaS CRM**

### **Scenario**

A CRM platform has an AI sales agent that wants to send follow-up emails to leads.

### **Flow**

1. Agent drafts email and calls POST /evaluate-step

2. HumanGate sees this is an external communication action

3. Response \= approval\_required

4. CRM calls POST /create-approval

5. Approval request is created with email preview, lead context, and rationale

6. Sales manager receives in-app approval card

7. Manager reads draft, removes two recipients, edits tone slightly, approves

8. CRM submits decision via POST /resolve-approval

9. Agent resumes using POST /resume-run

10. Email is sent only to approved recipients

11. Audit trail is stored

### **Value**

The CRM vendor gets agent approvals without building custom approval logic or storage.

---

## **Journey 2: Hosted dashboard for internal operations assistant**

### **Scenario**

A company has an internal ops agent that updates vendor records and issue statuses.

### **Flow**

1. Agent proposes changing 140 supplier records

2. HumanGate evaluates the action and requires approval because scope is large

3. Approval lands in the HumanGate dashboard inbox

4. Operations lead opens request in hosted dashboard

5. Detail view shows:

   * number of records affected

   * sample diff

   * reason for change

   * rollback possible \= yes

6. Ops lead approves only 100 records and excludes one vendor category

7. Agent resumes with constraints

8. Audit record is kept in dashboard

### **Value**

The company does not need to build a review UI at all.

---

## **Journey 3: Refund approval with escalation**

### **Scenario**

A support agent recommends a refund above a defined threshold.

### **Flow**

1. Agent prepares refund action

2. HumanGate policy evaluates refund amount and flags manager review

3. Approval packet includes:

   * customer issue summary

   * prior contacts

   * refund amount

   * policy threshold matched

4. Team lead opens approval request from dashboard link or embedded view

5. Team lead escalates to finance because amount exceeds a secondary threshold

6. Finance approves with a lower amount

7. Agent resumes and sends corrected compensation offer

8. Full audit trail preserved

### **Value**

Multiple human steps can be handled consistently, without custom branching logic per product.

---

## **Journey 4: Content publishing with revision request**

### **Scenario**

A content agent wants to publish a release note to a public changelog.

### **Flow**

1. Agent evaluates publication step

2. HumanGate requires approval because this is public-facing content

3. Approval packet includes preview and source references

4. Product marketer reviews and clicks “Request revision”

5. Comment: “Tone is too technical. Shorten intro.”

6. Agent revises draft and resubmits

7. Reviewer approves on second pass

8. Publishing action continues

9. Dashboard stores both the original and revised approval history

### **Value**

HumanGate supports collaborative revision instead of binary yes/no approval.

---

## **Journey 5: Low-confidence escalation**

### **Scenario**

An internal knowledge agent receives conflicting tool outputs and is unsure whether to update a compliance document.

### **Flow**

1. Agent calls POST /evaluate-step

2. Confidence is low and evidence is inconsistent

3. HumanGate returns escalate

4. Review packet clearly explains:

   * conflicting source results

   * confidence issue

   * recommendation to review manually

5. Compliance reviewer takes over manually

6. Workflow is marked human-owned from that point onward

### **Value**

HumanGate is not just for approval; it is also for safe escalation.

---

## **16\. Roles and permissions**

### **Reviewer**

Can approve, reject, request revision, or escalate assigned items.

### **Admin**

Can manage policies, reviewers, routes, and audit access.

### **Auditor**

Can inspect decision history and policy traces without taking actions.

### **Operator**

Can monitor workflow and status but may not approve certain actions.

MVP can keep role model simple.

---

## **17\. Policy model**

### **MVP policy inputs**

* action type

* target system

* external/internal

* confidence threshold

* reversibility

* entity count

* spend amount

* sensitivity level

* org/team

* approver role

### **Example rules**

* all external emails require team-lead approval

* refunds above £100 require manager review

* deletes are always blocked or escalated

* updates affecting more than 50 records require approval

* actions involving sensitive data require legal/compliance review

* low-confidence actions escalate automatically

### **MVP policy management**

Initially:

* API-configurable

* simple dashboard view

* no advanced visual rule builder required

---

## **18\. Notifications and delivery**

HumanGate should support multiple approval delivery surfaces over time.

### **MVP delivery**

* hosted dashboard inbox

* email notifications

* webhook events

### **Later**

* Slack approval cards

* Teams approval cards

* mobile push

* embedded widget components

This supports both build-your-own integration and ready-made review workflows.

---

## **19\. Business model**

## **API tier**

For companies embedding HumanGate into their apps or internal tools.

Possible pricing basis:

* approval evaluations per month

* approval packets created

* active workflows

* webhook volume

* audit retention period

## **Dashboard tier**

Premium add-on or higher subscription tier for:

* hosted approval inbox

* hosted audit center

* team management

* advanced routing

* dashboard analytics

### **Positioning**

This split is sensible:

* API-only for sophisticated customers

* API \+ dashboard for faster adoption and less engineering effort

* dashboard can be a monetizable upsell

---

## **20\. Why this is defensible**

HumanGate is not just a yes/no prompt.

Its defensibility comes from combining:

* policy evaluation

* decision packet creation

* reviewer routing

* role-aware review UX

* resume semantics

* audit traceability

That is more operational and workflow-specific than a model vendor primitive.

The moat improves with:

* policy templates

* high-quality approval packet formatting

* workflow-specific previews and diffs

* historical decision intelligence

* enterprise routing and governance features

---

## **21\. Main risks**

### **Risk 1: Too generic**

If HumanGate is framed as generic “human in the loop,” it may feel abstract.

Mitigation: start with agent write actions and external actions.

### **Risk 2: Too much friction**

If the system gates too many actions, it becomes annoying.

Mitigation: support thresholding, policy tuning, and clear low-risk auto-approve paths.

### **Risk 3: Weak reviewer UX**

If the approval experience feels like reading logs, usage will collapse.

Mitigation: design around decision cards, previews, and concise evidence.

### **Risk 4: Customers may want their own UI**

Some teams may not want hosted UI.

Mitigation: API-first design with dashboard as optional premium layer.

### **Risk 5: Complex enterprise requirements**

Large companies may demand identity, audit, and deployment features early.

Mitigation: keep MVP focused and move into enterprise controls later.

---

## **22\. Future roadmap**

## **Phase 2**

* Slack and Teams interactive approval cards

* richer reviewer routing

* conditional approvals

* approval delegation

* approval expiry and SLA handling

* dashboard analytics

* approval templates by workflow type

## **Phase 3**

* visual policy editor

* reusable policy packs

* org-level approval graph design

* historical decision recommendations

* anomaly detection for unusual approvals

* mobile approval experience

## **Phase 4**

* integration library for common agent frameworks

* identity/provider integrations

* deeper audit exports

* multi-step approval chains

* compliance-specific modules

* workflow benchmarking and decision optimization

---

## **23\. Success metrics**

### **Product metrics**

* approval turnaround time

* approval completion rate

* revision rate

* escalation rate

* percentage of actions auto-approved vs gated

* hosted dashboard adoption

* API-to-dashboard conversion rate

### **Quality metrics**

* reviewer satisfaction

* false-positive gating rate

* false-negative non-gating rate

* audit completeness

* successful workflow resume rate

### **Business metrics**

* number of active organizations

* number of embedded customers

* dashboard add-on attach rate

* approvals processed per month

* net revenue retention from upgraded control features

---

## **24\. MVP launch recommendation**

### **Initial product statement**

HumanGate is an API-first approval and escalation layer for agent actions, with an optional hosted dashboard for human review and audit.

### **Initial wedge**

Focus on:

* outbound actions

* write actions

* medium-risk business workflows

* products and internal teams that want agent autonomy but need human checkpoints

### **Initial packaging**

* Developer API

* Hosted approval dashboard

* Webhooks

* Email notifications

* Basic policy config

That is enough to test the market without overbuilding.

---

## **25\. One-line pitch**

HumanGate helps agentic systems pause at the right moments, show the right evidence, get the right approval, and resume safely.

---

## **26\. Short homepage draft**

### **Headline**

Safe approvals for agent actions

### **Subheadline**

HumanGate gives AI agents a structured way to pause before risky actions, collect evidence, route to a human reviewer, and continue with a full audit trail.

### **Supporting points**

* Evaluate whether an action should proceed, pause, escalate, or block

* Generate approval packets with previews, diffs, and evidence

* Embed in your app or use the hosted dashboard

* Resume workflows safely after human decisions

* Keep a complete audit trail across every gated action

---

## **27\. Blunt product take**

This is strong because it sits exactly where real companies will feel pain as they adopt agents.

The API is the infrastructure play.

The dashboard is the usability and monetization play.

The approval packet UX is the product heart.

If this were mine, I would position it first as:

HumanGate for agent write actions and external actions

not as a vague universal HITL platform.

That keeps it precise and sellable.

If you want, next I’ll turn this into a Claude/Cursor-friendly markdown build brief with:

* recommended DB schema

* endpoint request/response examples

* dashboard screen list

* MVP architecture

* phased implementation plan.

