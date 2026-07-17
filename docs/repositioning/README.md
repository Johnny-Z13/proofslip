# ProofSlip + Context Capsule Repositioning

Status: proposed execution plan
Owner: Z13 Labs
Implementation lead: Fable
Product, positioning, launch, and measurement lead: Codex

## Objective

Turn the existing domains, codebases, packages, and deployment infrastructure into two focused open-source agent utilities that earn regular external use.

Monetization is not required for the first win. It should be pursued as soon as repeated usage exposes a credible paid job.

## Product Contracts

### ProofSlip

**Receipts for what coding agents actually shipped.**

ProofSlip independently verifies a release claim against an authoritative provider and produces a portable proof that another agent or human can check.

Initial wedge: GitHub Actions release proof, with optional deployment URL observation. Vercel-native verification follows only after the GitHub-backed workflow gets real repeat usage.

### Context Capsule

**Hand off a coding task between AI agents without starting over.**

Context Capsule packages the minimum repository-aware execution context needed to move a task between Codex, Claude Code, Cursor, and other coding agents.

Initial wedge: local-first `/handoff` and `/resume` Skills. Hosted sharing remains optional and must not be the first-run requirement.

## Portfolio Rules

1. One concrete workflow per product before adding another.
2. Skills are the primary adoption surface; MCP and REST remain supported distribution surfaces.
3. The first useful result must not require payment and should not require an account where technically avoidable.
4. Artifacts carry attribution and a short install route, so outputs become the distribution loop.
5. ProofSlip may become the paid product. Context Capsule is initially an open-source utility and acquisition layer.
6. Do not market an abstract two-product ecosystem. Cross-link only where it improves a real workflow.
7. Do not add dashboards, providers, schemas, or framework wrappers without evidence of repeated use.
8. Existing APIs remain backward compatible during the experiment. Deprecate deliberately; do not silently break published packages.

## Execution Order

### Phase 0: Stabilize the existing products

- Finish the active bug-fix work already present in both worktrees.
- Preserve the current uncommitted work; do not reset or overwrite it when beginning repositioning.
- Deploy and verify canonical domains, signup email, cron cleanup, authenticated API calls, discovery endpoints, and package quick starts.
- Record the stable production commit for each product.
- Treat this as repair work, not validation of the old positioning.

### Phase 1: Ship ProofSlip Release Proof

Follow [proofslip-release-proof-plan.md](./proofslip-release-proof-plan.md).

ProofSlip goes first because authoritative provider verification offers the stronger commercial wedge.

### Phase 2: Ship Context Capsule Handoff

Follow [context-capsule-handoff-plan.md](./context-capsule-handoff-plan.md).

Context Capsule follows as a smaller, local-first utility. It should not delay ProofSlip.

### Phase 3: Launch and automate measurement

Follow [automated-adoption-plan.md](./automated-adoption-plan.md).

## Shared Definition of a Regular User

A regular user is an external repository or team that completes the product's core workflow in at least two separate weeks within a trailing 30-day window.

Downloads, API-key signups, stars, and registry listings are discovery signals. They are not regular users.

## Decision Gates

### Day 30 after launch

- At least five external projects have completed the core workflow.
- At least two have repeated it.
- At least one downstream person or agent has consumed the resulting proof or capsule.

If not, fix one observed onboarding or reliability problem. Do not add a new product surface.

### Day 60

- At least three external projects are regular users.
- There is at least one unsolicited issue, integration request, recommendation, or contribution.

If not, freeze feature development and keep the project available as a maintained open-source utility.

### Monetization gate

Offer a paid pilot when either condition occurs:

- Three independent teams request materially the same hosted or team feature.
- Ten teams use a product repeatedly and hosted operating cost or support becomes meaningful.

## Superseded Strategy

The following ideas should be retained as historical learning but no longer drive execution:

- Generic agent receipt infrastructure.
- Generic memory/state/intent infrastructure.
- Registry saturation as the primary growth strategy.
- Broad framework-wrapper expansion before repeat usage.
- The assumption that agents independently choose and install infrastructure.

The corrected viral thesis is: **agents encounter useful artifacts produced by other agents; the artifact introduces the tool.**

