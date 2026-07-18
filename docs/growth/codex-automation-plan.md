# ProofSlip Codex Automation Plan

Date: 2026-07-18

## Objective

Use scheduled Codex tasks to keep ProofSlip healthy, detect real adoption, find high-leverage distribution opportunities, and prepare useful growth work without creating spam or silently changing production.

The operating loop is:

1. Verify the product and its discovery surfaces.
2. Measure whether anyone outside Z13 is creating or viewing proofs.
3. Find new or degraded distribution surfaces.
4. Prepare one strong artifact or action.
5. Ask Johnny to approve anything public or externally mutating.
6. Measure the result and update the growth backlog.

This is an evidence-led propagation system, not an automated content mill.

## Critical prerequisite: fix the source message first

The live product now leads with provider-backed GitHub Actions release proofs. Some growth documents still lead with the older ephemeral receipt positioning. Automating from those documents would amplify stale messaging.

Before enabling growth automations, create one canonical source at `docs/growth/message-source.md` containing:

- Primary category: public, provider-backed release proofs for GitHub Actions.
- One-line promise: verify which GitHub Actions job ran for which repository, commit, workflow, and run.
- Trust boundary: provider claims, ProofSlip observations, and submitted context remain separate.
- Explicit non-claims: a proof does not establish that tests passed, the full workflow succeeded, or a deployment contains the commit.
- Public-data warning, including private-repository proofs.
- Current API, package, registry, and integration status.
- Legacy receipt API wording and its relationship to the primary release-proof product.
- Approved ProofSlip + ContextCapsule ecosystem description.

Every scheduled growth task should read this file first and flag drift rather than inventing positioning.

## Authority levels

Scheduled tasks should be assigned an explicit authority level.

### Level 1 — read and report

Allowed:

- Run tests and read public endpoints.
- Inspect GitHub, Vercel, Neon aggregate views, npm, PyPI, registries, and official framework sources.
- Compare current state with the playbook and previous report.
- Produce recommendations in the Codex task.

Not allowed:

- Edit files, send messages, submit forms, publish content, or change external state.

### Level 2 — prepare locally

Allowed:

- Everything in Level 1.
- Prepare a patch, draft, or implementation packet in an isolated branch/worktree.
- Run relevant tests.

Not allowed:

- Push, open a PR, publish packages, submit listings, or deploy.

### Level 3 — draft externally

Allowed only after explicit opt-in:

- Push an isolated branch and open a draft PR.
- Create a draft issue or draft document when the destination supports a non-public draft state.

Never allowed on a schedule:

- Direct pushes to `master`.
- Registry submissions, social posts, emails, or community replies.
- Package publication.
- DNS, environment-variable, billing, or production-database mutations.
- Deletion or cleanup of production data.
- Exposure of emails, tokens, connection strings, or repository identities from private proofs.

Start every automation at Level 1. Promote individual tasks only after their reports prove useful.

## Recommended launch set

Timezone: `Europe/London`.

| Task | Schedule | Initial authority | Purpose |
|---|---:|---:|---|
| ProofSlip Daily Sentinel | Daily, 08:00 | Level 1 | Detect production, discovery, deployment, or package breakage. |
| ProofSlip Adoption Pulse | Weekdays, 08:20 | Level 1 | Report aggregate organic usage and meaningful changes. |
| ProofSlip Propagation Scout | Monday, 09:00 | Level 1 | Find and rank current registry, framework, and ecosystem opportunities. |
| ProofSlip Artifact Brief | Wednesday, 09:00 | Level 1 | Turn the best opportunity into one implementation-ready brief. |
| ProofSlip Weekly Growth Review | Friday, 16:00 | Level 1 | Summarize movement, prune noise, and choose next week's single priority. |

Five tasks is the upper bound. If the output feels noisy, merge the Adoption Pulse into the Friday review and the Artifact Brief into the Monday scout.

## Task 1: ProofSlip Daily Sentinel

### Schedule

Daily at 08:00.

### Purpose

Catch silent failures in the product surfaces that enable agent discovery and trust.

### Checks

- Confirm `https://proofslip.ai` is canonical and `www` redirects without loops.
- Run the production smoke suite once.
- Check homepage, docs, privacy, `llms.txt`, `llms-full.txt`, OpenAPI, MCP, agent, plugin, and sitemap endpoints.
- Assert that release-proof creation rejects missing credentials with the structured error envelope.
- Assert that a missing proof ID reaches the database-backed route and returns the expected structured `404`.
- Check the latest `master` deployment status and commit association.
- Check npm and PyPI package pages resolve; do not treat reserved example URLs as outbound links.
- Report certificate, redirect, schema, or discovery drift.

### Output

When green:

```text
GREEN — production and discovery surfaces passed; deployed commit matches master.
```

When broken:

- First broken boundary.
- Exact status/error and affected URL.
- Whether it is production-only or reproducible locally.
- Smallest recommended fix.
- No automatic fix or push.

### Ready-to-use prompt

```text
Work in /Users/johnnyvenables/Projects/Products/proofslip. Read AGENTS.md and docs/growth/message-source.md first. Operate read-only. Fetch origin, identify the deployed master commit, run npm run test:smoke once, and verify the public release-proof discovery and error-contract surfaces. Stop at the first confirmed broken boundary and report evidence. If all checks pass, return one concise GREEN status. Do not edit files, expose secrets, mutate data, or deploy.
```

## Task 2: ProofSlip Adoption Pulse

### Schedule

Weekdays at 08:20. Suppress a long report when there is no material change.

### Prerequisite

Create a dedicated read-only Neon role or read-only reporting endpoint. Do not give a scheduled task the production owner connection string.

Create one reviewed script, for example `scripts/growth-pulse.ts`, that returns aggregate JSON only. The task should run the script rather than composing arbitrary SQL.

### Metrics

Compare the last 24 hours with the previous seven-day daily average:

- Release proofs created.
- Creation failures grouped by non-sensitive reason.
- Human proof views.
- JSON proof fetches.
- Unique repository digests, excluding known Z13/canary repositories.
- Public versus non-public repository visibility counts.
- View-to-create and fetch-to-create ratios.
- New legacy API-key accounts as a count only.
- Legacy API activity as aggregate counts only.
- First observed organic event and any new all-time high.

Never output:

- Email addresses.
- Raw repository names for private repositories.
- Submitted context.
- Tokens, IPs, connection strings, or API keys.

### Noise rules

- Explicitly label first-party and automated canary traffic.
- Do not call first-party tests "adoption."
- If every organic metric is zero, say so plainly.
- Alert immediately only for an organic first proof, a large failure spike, or an unexpected traffic discontinuity.

### Ready-to-use prompt

```text
Work in /Users/johnnyvenables/Projects/Products/proofslip. Read AGENTS.md, docs/growth/message-source.md, and the reviewed aggregate growth-pulse script. Operate read-only. Produce a privacy-safe 24-hour adoption pulse compared with the prior seven-day baseline. Exclude known Z13 and canary traffic from organic counts. Never print emails, private repository names, submitted context, secrets, IPs, or raw database rows. If there is no material change, return a two-line zero-change report. Do not edit files or mutate production.
```

## Task 3: ProofSlip Propagation Scout

### Schedule

Monday at 09:00.

### Purpose

Find current, credible places where release-proof/v1 should be discoverable or natively useful.

### Sources

Use current primary sources wherever possible:

- Official MCP Registry and its specification/release notes.
- PulseMCP, Smithery, Glama, and other active MCP directories.
- npm and PyPI package metadata.
- GitHub repository and package dependents where visible.
- Official LangChain, LangGraph, CrewAI, AutoGen, n8n, OpenAI, Anthropic, GitHub Actions, and Vercel documentation/release notes.
- Search results for the exact ProofSlip name, package names, API domain, and `release-proof/v1`.

### Questions

- Are existing listings present, current, and using release-proof messaging?
- Is any listing still describing only legacy receipts?
- Has a framework introduced a new tool, registry, marketplace, attestation, provenance, or deployment-hook surface?
- Is a thin integration genuinely useful, or would it be wrapper churn?
- Are there broken links, stale versions, missing badges, or discoverability regressions?
- Is ProofSlip appearing anywhere we did not submit it?

### Ranking rubric

Score each opportunity from 0–3 on:

- Agent discovery leverage.
- Relevance to release verification/provenance.
- Implementation effort, inverted so low effort scores higher.
- Maintenance burden, inverted.
- Evidence that the surface is active.

Return only the top three. Recommend exactly one next action.

### Ready-to-use prompt

```text
Work in /Users/johnnyvenables/Projects/Products/proofslip. Read AGENTS.md, docs/growth/message-source.md, docs/growth/playbook.md, and docs/growth/log.md. Operate read-only. Research current primary sources for ProofSlip's registry presence, package visibility, framework compatibility, and new release-proof distribution surfaces. Verify dates and current status. Rank only the top three opportunities by discovery leverage, product fit, effort, maintenance burden, and evidence that the surface is active. Recommend one next action. Cite direct sources. Do not submit listings, contact anyone, edit files, or publish.
```

## Task 4: ProofSlip Artifact Brief

### Schedule

Wednesday at 09:00.

### Purpose

Convert the best verified opportunity into one small, high-quality work packet instead of producing generic content.

### Permitted artifact types

- A listing-copy update mapped to the canonical message source.
- A draft framework integration specification with maintenance and test costs.
- A reference GitHub Actions workflow demonstrating release-proof creation.
- A tutorial outline based on a real, reproducible workflow.
- A public-contract patch plan for discovery drift.
- A comparison or decision note explaining why an apparent opportunity should be skipped.

### Required brief

- Audience and discovery surface.
- User problem.
- Why ProofSlip is materially useful there.
- Exact deliverable and acceptance criteria.
- Files or external surfaces affected.
- Tests and maintenance burden.
- Privacy/trust-boundary risks.
- Estimated effort: small, medium, or large.
- Publish path and human approval point.

Only one artifact per week. A strong "skip" recommendation is better than filler.

### Ready-to-use prompt

```text
Work in /Users/johnnyvenables/Projects/Products/proofslip. Read AGENTS.md, docs/growth/message-source.md, and the latest Propagation Scout report. Operate read-only. Select the single highest-leverage verified opportunity and produce an implementation-ready artifact brief with audience, problem, exact deliverable, acceptance criteria, affected surfaces, tests, maintenance cost, privacy and trust risks, effort, and approval point. Do not write generic social content. Do not edit code, submit forms, contact anyone, or publish.
```

## Task 5: ProofSlip Weekly Growth Review

### Schedule

Friday at 16:00.

### Purpose

Close the loop and prevent the automation program from becoming a pile of reports.

### Review

- Production reliability for the week.
- Organic creation/view/fetch movement, excluding first-party traffic.
- New listings, mentions, dependents, stars, package downloads, or inbound issues.
- Tasks completed versus recommendations repeated without action.
- Messaging drift found or fixed.
- The week's strongest evidence for or against the ecosystem-saturation thesis.
- One task to do next week and one task to stop or defer.

### Output

```text
WEEKLY VERDICT: growing / unchanged / unclear / regressing
Evidence:
- ...

Next week's one priority:
- ...

Stop or defer:
- ...
```

### Ready-to-use prompt

```text
Work in /Users/johnnyvenables/Projects/Products/proofslip. Read AGENTS.md, docs/growth/message-source.md, docs/growth/playbook.md, docs/growth/log.md, and this week's scheduled-task reports. Operate read-only. Produce a concise weekly verdict using production reliability, privacy-safe organic usage, package and registry movement, completed work, repeated recommendations, and messaging drift. Choose exactly one priority for next week and one item to stop or defer. Distinguish evidence from inference. Do not edit files or publish.
```

## A separate non-Codex canary is needed for the real OIDC path

A local or scheduled Codex task cannot mint a genuine GitHub Actions OIDC token. The fully valid production path therefore needs a GitHub Actions canary, not a Codex scheduler.

Recommended design:

- Trigger after a production release rather than daily.
- Request an OIDC token with audience `https://proofslip.ai`.
- Create one real proof.
- Fetch its JSON and human URL.
- Assert repository, SHA, workflow reference, run ID, trust labels, and expiry.
- Add a clear canary label in submitted context.
- Exclude the known canary repository from organic adoption reports.

Important tradeoff: V1 does not automatically delete expired proof records. A daily canary would create permanent public noise and contaminate adoption metrics. Release-triggered execution is the smallest responsible cadence until retention/deletion exists.

## State and deduplication

Do not let daily tasks write report files into `master`; that creates permanent worktree churn.

For the first month:

- Keep recurring reports in their Codex task threads.
- Treat `docs/growth/playbook.md` and `docs/growth/log.md` as human-approved source of truth.
- Have the Friday review identify repeated recommendations.
- Update the playbook/log only through an intentional implementation task and reviewed commit.

If cross-task memory proves inadequate, add a small reviewed `docs/growth/automation-state.json` later. Do not introduce it pre-emptively.

## Success metrics for the automation program

After 30 days, keep an automation only if it does at least one of these:

- Detects a real production or discovery regression.
- Finds a credible new distribution surface.
- Produces a brief that becomes shipped work.
- Identifies the first or growing organic adoption signal.
- Prevents stale messaging or package/listing drift.

Program-level metrics:

- False alarms per month.
- Reports that led to action.
- Median time from detected drift to fix.
- New active listings or integrations.
- Organic external repositories creating proofs.
- Organic proof views/fetches.
- Package downloads and dependents, treated as supporting rather than primary evidence.

Stop tasks that mostly repeat themselves, produce generic prose, or generate work with no plausible discovery path.

## Rollout

### Week 0 — prepare

1. Create and approve `docs/growth/message-source.md`.
2. Update the thesis, playbook, listing cheat sheet, and growth log to the release-proof position.
3. Define known first-party/canary repositories.
4. Build and test the aggregate-only growth pulse with a read-only database role.
5. Decide whether the release-triggered GitHub Actions canary is acceptable under V1 retention.

### Week 1 — reliability only

Enable the Daily Sentinel. Tune false positives before adding more tasks.

### Week 2 — opportunity discovery

Enable the Monday Propagation Scout and Friday Growth Review.

### Week 3 — adoption signal

Enable the Adoption Pulse only after the read-only telemetry path and privacy review are complete.

### Week 4 — artifact conversion

Enable the Wednesday Artifact Brief. Keep it Level 1 for at least two runs.

### Day 30 — prune

Review every automation. Delete or merge noisy tasks. Consider promoting only the Artifact Brief to Level 2 local preparation; keep publishing and direct deployment human-approved.

## Recommended immediate next step

Do not schedule all five tasks now. First:

1. Approve and build the canonical message source.
2. Create only the Daily Sentinel at 08:00 Europe/London.
3. Let it run for one week.
4. Add the Monday Scout and Friday Review if the sentinel is quiet and useful.

This establishes a reliable signal loop before spending time or attention on propagation work.
