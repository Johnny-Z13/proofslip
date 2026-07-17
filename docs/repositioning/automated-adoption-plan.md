# Automated Adoption and Marketing Plan

Status: proposed
Applies to: ProofSlip and Context Capsule
Owner: Codex for product/marketing; Fable for implementation automation; Johnny for final external-account actions

## 1. Goal

Create a low-maintenance adoption system that can produce regular open-source users without requiring daily social posting or dozens of live interviews.

Automation can maintain distribution, demonstrations, releases, and measurement. It cannot manufacture usefulness. The products must earn repeat use through their core workflows.

## 2. North-Star Metric

**Weekly active external projects**: external repositories or teams that complete a core workflow during the week.

Product metrics:

### ProofSlip

- External repositories creating provider-backed release proofs.
- Proofs opened or fetched by a downstream user or agent.
- Repositories creating proofs in multiple weeks.
- Proof creation success rate.

### Context Capsule

- Skill installs.
- Successful optional hosted handoffs and resumes.
- Cross-tool resume reports or examples.
- External projects using the workflow in multiple weeks.

Supporting signals:

- GitHub stars, forks, issues, discussions, pull requests, and contributors.
- npm, PyPI, MCP, and Skills directory installs.
- README-to-install click-through where observable without invasive tracking.

Do not use API-key signups or package downloads as the headline adoption metric.

## 3. The Artifact-Led Growth Loop

### ProofSlip

1. A repository creates a release proof.
2. The proof URL appears in a GitHub Actions summary, release, PR, task, or agent handoff.
3. A downstream agent or human verifies it without registering.
4. The proof page offers a short install route.
5. Another repository adopts the workflow.

### Context Capsule

1. An agent creates a handoff capsule.
2. The capsule moves to another agent, session, or person.
3. The receiving agent resumes and sees the compatibility result.
4. The Markdown footer contains a restrained install route.
5. The recipient installs the Skill for the next handoff.

Attribution must be small, factual, and removable. Do not turn user artifacts into advertisements.

## 4. Distribution Surfaces

### Shared

- GitHub repositories and releases.
- Skills.sh-compatible repository Skills.
- Agent Skills directories that accept GitHub submissions.
- Existing MCP registry listings.
- Existing npm and PyPI packages.
- `llms.txt`, OpenAPI, and machine-readable discovery documents.
- One working demo repository per product.

### ProofSlip-specific

- GitHub Actions workflow example initially.
- GitHub Marketplace Action after the workflow proves stable.
- Release and deployment automation examples.

### Context Capsule-specific

- Cross-client Skill compatibility pages.
- A demonstration showing the same task moving between two agents.
- Optional templates for coding, research, and incident handoffs only after the coding template is used.

## 5. Release Automation

Create a repeatable tagged-release pipeline for each repository.

On a release tag:

1. Run unit, integration, package, and production-contract tests.
2. Build packages.
3. Verify package contents and README links.
4. Publish npm packages through trusted publishing where supported.
5. Publish PyPI packages through trusted publishing where applicable.
6. Create GitHub release notes from an intentional changelog.
7. Verify the production site and discovery endpoints.
8. Update the live demo only after production checks pass.

Do not automatically publish from every merge to main.

Maintain a canonical product-metadata document per repository containing:

- Product name.
- One-sentence promise.
- Canonical domain.
- Repository URL.
- Install commands.
- Package names and versions.
- Core tool names.
- Primary quick-start URL.

Use it to validate, not blindly rewrite, README, site, package, MCP, OpenAPI, and directory metadata so positioning does not drift.

## 6. Continuous Demonstrations

### ProofSlip demo

- A public demo repository runs a controlled release workflow on a schedule and on tagged demo releases.
- It produces a real provider-backed proof.
- The homepage links to the latest valid proof.
- A monitor verifies the proof page, JSON endpoint, GitHub links, and deployment observation.

### Context Capsule demo

- Store a small public sample project and two agent transcripts or scripts demonstrating `/handoff` and `/resume`.
- CI validates the capsule schema and staleness behavior.
- Do not fabricate active-user activity or generate meaningless public capsules on a schedule.

## 7. Automated Measurement

Generate one weekly report covering both products.

Inputs:

- GitHub API: stars, forks, contributors, issues, discussions, releases, clones where available.
- npm downloads API.
- PyPI Stats API.
- Skills directory install counts where available.
- MCP registry package version checks.
- Aggregate application metrics from a protected endpoint or read-only reporting role.

Internal application metrics must contain aggregates only. Do not expose email addresses, API keys, tokens, full IP addresses, private repository names, capsule content, or proof payloads.

Suggested report sections:

- Weekly active external projects.
- First-time successful projects.
- Repeat projects.
- Artifacts created.
- Downstream artifact consumption.
- Funnel failures by reason.
- Support and feedback themes.
- Recommended action: continue, fix one bottleneck, expand, monetize, or freeze.

Delivery:

- Create or update a private GitHub issue labelled `growth-report`, or save a local report under a gitignored results directory.
- Do not generate noisy weekly commits to the product repositories.

## 8. Reliability Monitoring

Automate checks for the paths that determine adoption:

- Canonical domain and redirect behavior.
- Authenticated requests after redirects.
- Signup email acceptance.
- Core API lifecycle.
- Skill install command.
- Package startup.
- Discovery endpoints and links.
- Latest demo proof.
- Hosted capsule create/fetch where retained.

Alerts should go to one quiet channel or issue queue. Avoid multiple overlapping monitors.

## 9. Launch Assets

Codex owns the first version of:

- Homepage positioning and information hierarchy.
- Repository README narrative.
- Package and directory descriptions.
- Five-minute quick starts.
- Demo scripts and screenshots.
- One Show HN draft per product.
- One evergreen technical article per product.
- Five personalized seed messages per product.
- FAQ and objection handling.

Johnny approves and performs account-bound submission actions. Fable handles only the implementation and release mechanics.

### ProofSlip launch story

Working title:

> Show HN: ProofSlip - provider-backed release receipts for coding agents

Evergreen article:

> Your coding agent says it deployed. What can you actually verify?

### Context Capsule launch story

Working title:

> Show HN: Context Capsule - hand off a coding task between AI agents

Evergreen article:

> Switching from Codex to Claude Code without explaining the task again

Do not launch both products in the same week.

## 10. Low-Touch Seeding

For each product:

1. Publish the working Skill and demo.
2. Submit it to relevant Skill and MCP directories.
3. Publish one Show HN post.
4. Send five personalized messages to maintainers or developers whose public workflow clearly matches the use case.
5. Offer setup help, not a sales call.
6. Record objections and failed onboarding steps.

Do not mass-message, automate unsolicited outreach, or post repetitive promotional content.

## 11. Content Automation Boundaries

Safe to automate:

- Release notes from reviewed changelog entries.
- Version and compatibility tables.
- Link checking.
- Demo proof refresh.
- Social preview generation.
- Weekly metrics summaries.
- Drafting launch updates for human approval.

Do not automate:

- Unsolicited DMs or email campaigns.
- Fake community engagement.
- Programmatic SEO pages with no unique value.
- AI-generated daily social posts.
- Claims about users, reliability, or verification that are not supported by metrics.

## 12. Thirty-, Sixty-, and Ninety-Day Plan

### Before Day 0

- Finish stabilization.
- Ship one core workflow.
- Verify the demo and first-run experience.
- Install measurement.
- Prepare all launch assets.

### Days 0-30

- Launch one product, beginning with ProofSlip.
- Submit directories and the one-off launch post.
- Seed five relevant developers or projects.
- Fix only blockers in install, first success, and artifact consumption.
- Do not add a second provider or new schema.

### Days 31-60

- Determine whether at least three projects repeated the workflow.
- If yes, improve reliability and the most common workflow.
- If no, make one evidence-backed positioning or onboarding correction.
- Launch Context Capsule only when ProofSlip is stable enough not to demand daily attention.

### Days 61-90

- Continue products with repeat external use.
- Freeze products without repeat use.
- Offer a paid founder pilot if repeated feature requests meet the monetization gate.
- Publish a transparent results or learning post if useful.

## 13. Funnel Diagnosis

Use this order when numbers are weak:

1. **No impressions**: directory, title, repository, or launch distribution problem.
2. **Impressions but no installs**: promise or trust problem.
3. **Installs but no first success**: setup or reliability problem.
4. **First success but no artifact consumption**: output is not entering a real workflow.
5. **Artifact consumption but no repeat use**: job is not recurring or product adds too little value.
6. **Repeat use but no willingness to pay**: keep open source until a hosted pain appears.

Do not solve a higher-numbered problem before the earlier stage works.

## 14. Monetization Plan

Open source is the acquisition model, not a restriction on revenue.

### ProofSlip likely paid surfaces

- Private proofs.
- Longer retention.
- Provider connections and commit-to-deployment verification.
- Team identities and policy gates.
- Signed exports and audit retention.
- Webhooks, support, and reliability guarantees.

### Context Capsule likely paid surfaces

- End-to-end encrypted team sharing.
- Team handoff inbox and access controls.
- Search and longer retention.
- Issue tracker and repository integrations.
- Templates, policies, SSO, and audit controls.

### Pricing experiment rule

When three teams request the same paid capability:

1. Offer a manual founder pilot.
2. Quote a real monthly price before building automation.
3. Deliver partly manually if safe and practical.
4. Build the reusable feature only after at least one team agrees to pay.

## 15. Ownership

### Fable

- Code, API, migrations, packages, tests, CI, deployment, security fixes, and production verification.
- Implements only accepted plan items.
- Flags architectural or security constraints before expanding scope.

### Codex

- Product scope and sequencing.
- Positioning, website copy, README narrative, quick starts, launch materials, directory descriptions, seed-target research, and weekly commercial assessment.
- Reviews product truth against marketing claims.
- Recommends continue, adjust, monetize, freeze, or archive.

### Johnny

- Final product decisions.
- Approval of external submissions, account actions, outreach, pricing, and material scope expansion.
- Provides occasional authentic founder voice when a launch requires it.

## 16. Success Definition

The base win is not a valuation or a large launch.

The base win is:

- A useful open-source tool.
- A small number of external projects using it repeatedly.
- Reliable infrastructure and good documentation.
- Artifacts that naturally introduce the product to downstream agents.
- Credible public evidence that Z13 Labs can identify, build, ship, and maintain agent infrastructure.

If a monetizable pain emerges, the plan converts that use into revenue rather than treating open source as the final ceiling.

## 17. Distribution References

- [Skills.sh installation and ranking documentation](https://www.skills.sh/docs)
- [Publishing GitHub Actions in GitHub Marketplace](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace)
- [Show HN guidelines](https://news.ycombinator.com/showhn.html)
- [Agent Skills overview](https://agentskills.io/home)
