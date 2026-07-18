# ProofSlip Growth Thesis

Canonical messaging: [`message-source.md`](message-source.md)

## The bet

AI coding agents are getting better at writing, testing, and shipping software, but their release claims are still usually transmitted as prose: "deployed," "tests passed," or "production is updated."

The next agent or human needs a narrower, verifiable answer: **which provider-backed GitHub Actions job identity stands behind this release claim?**

ProofSlip verifies the GitHub Actions OIDC token and produces a stable public proof of the repository, commit, ref, workflow, and run. The bet is that this proof becomes a standard handoff object for agent-driven releases.

## Why the proof itself can propagate the product

ProofSlip has a protocol-level distribution loop:

1. A release workflow creates a ProofSlip.
2. The proof URL is attached to a job summary, release, task, or agent handoff.
3. Another agent or human fetches the proof before continuing.
4. The proof visibly identifies ProofSlip and exposes a reusable public contract.
5. The receiving workflow can adopt the same pattern.

The public proof is the breadcrumb. Distribution should therefore prioritize places where release artifacts and agent handoffs already move, rather than generic broadcast marketing.

## Why ecosystem saturation still matters

Agents and their developers discover tools through machine-readable and workflow-native surfaces:

- GitHub Actions workflow examples and reusable release patterns.
- OpenAPI and agent manifests.
- `llms.txt` and other agent-readable context.
- CI/CD, provenance, and deployment ecosystems.
- MCP registries and framework packages, where the integration really supports the advertised capability.

ProofSlip should be present wherever an agent looks for release verification, but presence alone is not enough. Every surface must use the same narrow trust claim and must distinguish the primary release-proof API from legacy receipt integrations.

## Why not a generic utility library

A generic retry or idempotency wrapper would compete with mature queue, workflow, and payment infrastructure. It would also position ProofSlip as an implementation convenience rather than an evidence protocol.

ProofSlip is not a retry library. Its defensible role is **portable release evidence with explicit trust boundaries**.

## The product position

- **ProofSlip** is evidential: "Here is what was verified, by whom, and when."
- **ContextCapsule** is navigational: "Here is the situation, what matters, and what should happen next."

Together they support reliable agent handoffs. ProofSlip supplies inspectable evidence; ContextCapsule supplies the context and next-step intent.

The original short-lived receipt API remains useful for approvals, handshakes, failure records, and polling. It is a legacy product surface, not the lead message for release-proof/v1.

## Who should find ProofSlip

1. Developers supervising AI coding agents.
2. Teams automating releases with GitHub Actions.
3. CI/CD and platform engineers who need portable provenance.
4. Agent-framework and tool builders that need a verifiable handoff object.
5. Agents deciding whether a release claim has provider-backed evidence.

## Trust is part of the distribution strategy

ProofSlip should grow by making a precise claim, not the largest possible claim.

A release proof establishes the GitHub Actions job identity and execution context that requested it. ProofSlip observations and workflow-supplied labels remain separate. It does not prove that tests passed, that the full workflow succeeded, or that a deployment contains the commit.

This restraint makes the proof more reusable. Agents can reason from each evidence category without inheriting hidden assumptions.

## Success looks like

Primary signals:

- Proofs created by repositories outside known Z13 and canary traffic.
- Public proof URLs fetched or viewed by other workflows and humans.
- Proof URLs appearing in release records and agent handoffs.
- External repositories adopting the workflow pattern without direct onboarding.
- ProofSlip suggested by an agent in response to a release-verification need.

Supporting signals:

- Current, accurate registry and directory listings.
- Package downloads and dependents.
- Inbound issues, integration requests, and references.
- ContextCapsule workflows referencing ProofSlip evidence.

Email signups, first-party smoke tests, and automated canaries are not organic adoption.

## Monetization stance

The legacy receipt API has an account and usage model. Release-proof/v1 currently requires no ProofSlip account or API key, and its monetization model is not yet established.

Do not reuse legacy receipt quotas or pricing as the release-proof growth story. The immediate objective is to learn whether public release evidence becomes a repeated workflow primitive. Monetization should follow demonstrated production usage and its actual cost/retention requirements.
