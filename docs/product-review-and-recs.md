# ProofSlip: Product Review & Strategic Recommendations

> **Date:** 2026-04-06
> **Status:** Pre-adoption — zero users, strong technical execution
> **Purpose:** Capture learnings, validate future ideas, document pivot approaches

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [What Was Built](#what-was-built)
3. [Market Reality Check](#market-reality-check)
4. [Competitive Landscape](#competitive-landscape)
5. [User Pain Point Analysis](#user-pain-point-analysis)
6. [Viability Scores](#viability-scores)
7. [Why It Didn't Work](#why-it-didnt-work)
8. [Pivot Analysis](#pivot-analysis)
9. [Initial Pivot Recommendation: MCP Developer Tools](#recommended-pivot-mcp-developer-tools)
10. [Validation Results: MCP Dev Tools](#validation-results-mcp-dev-tools)
11. [Validated Pivot Recommendation](#validated-pivot-recommendation)
12. [Lessons Learned](#lessons-learned)
13. [Pre-Build Validation Checklist](#pre-build-validation-checklist)
14. [Plan Summary](#plan-summary)

---

## Executive Summary

ProofSlip is a technically excellent product that solves a real problem in a way the market doesn't want. The underlying pain points (duplicate agent actions, stale approvals, unsafe retries, handoff ambiguity) are genuine and documented. But the market solves them through **orchestration platforms** (Temporal, Inngest) and **framework-native checkpointing** (LangGraph, CrewAI), not standalone receipt APIs.

The "agents will discover us through registries" thesis is technically sound (MCP-Zero paper validates autonomous tool discovery) but insufficient — with 12,000+ MCP servers, registry presence is table stakes, not differentiation.

**Best pivot (post-validation):** MCP Developer Tools remain the strongest direction, but the validation checklist revealed the space is more crowded than initially assessed. The viable wedge is **narrow and specific** — cross-client compatibility testing or tool description quality linting — not a broad "MCP doctor" toolkit. See [Validated Pivot Recommendation](#validated-pivot-recommendation) for the refined approach.

---

## What Was Built

### Core Product
- Ephemeral receipt API (create, verify, poll, expire)
- 5 receipt types: action, approval, handshake, resume, failure
- 24-hour TTL by default, auto-cleanup via cron
- Dual interface: JSON for agents, styled HTML for humans
- Idempotency keys for safe retries
- Built-in polling guidance (is_terminal, next_poll_after_seconds)

### Technical Stack
- Hono v4 + Drizzle ORM + Neon PostgreSQL + Vercel serverless
- TypeScript strict mode, Vitest test suite (~184 tests across 4 layers)
- Pre-push hook, test orchestrator, comprehensive CI hygiene

### Published Packages
- `@proofslip/mcp-server@0.2.3` (npm + official MCP registry)
- `langchain-proofslip@0.1.0` (PyPI)

### Registry Presence
- Smithery (mcp.so)
- Glama.ai
- Official MCP Registry (DNS auth via ed25519)
- PulseMCP (auto-ingest)
- GPT Store ("Proofslip Assistant")

### Discovery Infrastructure (9 endpoints)
- `/llms.txt` and `/llms-full.txt`
- `/.well-known/openapi.json`
- `/.well-known/mcp.json`
- `/.well-known/ai-plugin.json`
- `/.well-known/agent.json`
- `/docs`, `/privacy`, `/sitemap.xml`

### Sister Product
- **ContextCapsule** (contextcapsule.ai) — execution context packets for agent handoffs
- Complementary primitive: ProofSlip = evidential, ContextCapsule = navigational
- Same stack, brand, patterns

### What Went Right
- API design is clean and thoughtful
- Test coverage is exceptional for a solo project
- Registry blitz execution was fast and thorough
- Discovery infrastructure is best-in-class
- The receipt metaphor is intuitive and well-documented

---

## Market Reality Check

### How the Market Actually Solves Verification

| Framework | Built-in Solution | Makes ProofSlip Redundant? |
|-----------|------------------|---------------------------|
| **LangGraph 1.0** | Checkpointing at every node, time-travel replay | Yes, within LangGraph |
| **Temporal** | Append-only event history, every step inherently proven | Yes, within Temporal |
| **Inngest** | Durable steps, atomic + persisted, auto-retried | Yes, within Inngest |
| **CrewAI** | Task guardrails validate output per step | Mostly, within CrewAI |
| **OpenAI Agents SDK** | Tracing + session history, no formal verification | Partial gap exists |

**Key insight:** Most agent workflows today live inside a single framework (no hard data exists on the split, but cross-framework handoffs are emerging, not yet mainstream). Within-framework verification is a solved problem. ProofSlip's value exists only in the narrow gap of **cross-framework** verification.

### Cross-Framework Gap — Real but Closing

The A2A protocol (Google + IBM → Linux Foundation, 150+ orgs) addresses cross-agent trust with:
- Cryptographic signing and Verifiable Credentials
- Agent Cards with attestation
- SDKs in Python, TypeScript, Java, Go
- v0.3 added gRPC and signed security cards

ProofSlip's lightweight approach has appeal, but it competes against an institutional standard.

### MCP Ecosystem Context

| Metric | Value |
|--------|-------|
| Total MCP servers | ~12,000+ |
| MCP SDK downloads/month | 97M+ |
| Growth rate | 873% (mid-2025 to early 2026) |
| Quality (1,400 server analysis) | Median: 5 tools, 38.7% no auth, most experimental |
| Companies with APIs that have MCP servers | <1% |

The ecosystem is large but thin. Being listed is necessary but not sufficient for discovery.

### Market Vocabulary Mismatch

Developers experiencing ProofSlip's target problems search for:
- "Agent state management"
- "Durable execution"
- "Workflow orchestration"
- "Agent checkpointing"
- "Idempotency"

Nobody searches for "agent receipts" or "agent verification API." The framing doesn't match how the market describes the pain.

---

## Competitive Landscape

### Direct Competitors
**None.** The "standalone agent receipt API" category does not exist as a product market.

This is either a blue ocean or evidence the market doesn't want a standalone solution. Based on all signals: the market doesn't want it standalone.

### Indirect Competitors (Features of Larger Products)

| Product | What It Does | Funding/Scale |
|---------|-------------|---------------|
| **Temporal** | Durable execution with full event history | $1.4B+ raised |
| **Inngest** | Serverless durable functions, AgentKit | Well-funded |
| **LangGraph** | Graph-based agent orchestration with checkpoints | Part of LangChain ecosystem |
| **Mastra** | TypeScript-first agent SDK | $13M YC seed, 300K weekly npm downloads |
| **Vercel AI SDK** | Most-downloaded TS AI framework | Part of Vercel |

---

## User Pain Point Analysis

| Pain Point | Real? | ProofSlip Solves It? | Market's Preferred Solution |
|-----------|-------|---------------------|----------------------------|
| Duplicate agent actions (re-charging cards, re-sending emails) | **Yes** — production teams report this | Yes | Idempotency keys + durable execution |
| Stale approval states | **Yes** | Yes | LangGraph checkpoints, human-in-loop |
| Unsafe retries after failure | **Yes** | Yes | Durable execution platforms |
| Cross-framework handoff verification | **Yes** — growing need | **Yes — unique value** | A2A protocol (emerging) |
| Agent self-discovery of tools | **Partially** | Good discovery surface | Every MCP server has this |
| "Did this already happen?" | **Yes** | Yes | Temporal/Inngest event history |

**Pattern:** Real problems, but ProofSlip competes with **features** of much larger platforms. The market reaches for orchestration, not standalone verification.

---

## Viability Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| Technical Execution | **9/10** | Clean API, great tests, comprehensive discovery |
| Problem Validity | **6/10** | Real problems, solved differently by market |
| Market Fit | **3/10** | No demand signal, vocabulary mismatch, zero adoption |
| Competitive Position | **4/10** | No moat; frameworks solve internally, A2A emerging |
| Growth Strategy | **5/10** | Registry blitz was smart but hasn't converted |
| Revenue Potential | **3/10** | Usage-based with free tier, but need adoption first |
| Return Users | **3/10** | Transactional product, no engagement loop |
| **Overall Viability** | **4/10** | Well-built solution the market solves differently |

### Return User Projections

| Timeframe | Optimistic | Realistic | Pessimistic |
|-----------|-----------|-----------|-------------|
| 6 months | 10-20 signups, 2-3 active | 3-5 signups, 0-1 active | 0 signups |
| 12 months | 50-100 signups, 10-15 active | 10-20 signups, 2-3 active | 1-5 signups, 0 active |
| 24 months | 200+ signups, 30+ active | 30-50 signups, 5-10 active | <20 signups |

---

## Why It Didn't Work

### 1. Category creation is nearly impossible for solo builders
Creating a new product category ("agent receipts") requires massive education spend. Solo builders win by entering existing categories with better execution, not by inventing new ones.

### 2. Infrastructure without integration is invisible
ProofSlip asks developers to add a new dependency to their stack. The market prefers solutions embedded in tools they already use (LangGraph plugins, Temporal activities, framework middleware).

### 3. Virality requires a first mover
The verify_url virality thesis (Agent A creates receipt → Agent B discovers ProofSlip by verifying) requires someone to create the first receipt. Cold start problem with no forcing function.

### 4. Free tier too generous for conversion
500 receipts/month with no dashboard means experimenters never hit a paywall and never become invested users.

### 5. Transactional product, no retention loop
Create → verify → expire. No dashboard, history, or community. No reason to return to proofslip.ai after integration.

---

## Pivot Analysis

Five pivots evaluated. Ranked by viability:

### Rank 1: MCP Developer Tools — **RECOMMENDED**
**Concept:** CLI + hosted dashboard for linting, testing, and monitoring MCP servers.

| Factor | Assessment |
|--------|-----------|
| Market demand | **Strong.** MCP 2026 roadmap explicitly calls out missing tooling. 12K+ servers need quality infrastructure. |
| Competition | **Low in niche.** Gateways (Kong, Docker) are separate market. No dedicated quality/readiness toolkit exists. |
| Reuse of existing assets | **High.** MCP protocol knowledge, npm publishing, Vercel/Hono stack, TypeScript expertise all transfer directly. |
| Revenue potential | **Medium.** Freemium CLI → paid dashboard. $10-50/month. Micro-SaaS achievable. |
| User acquisition | **Concrete.** Ship CLI (`npx your-tool check`), list on registries you know, write definitive MCP guide, engage in MCP community. |
| Risk | **Medium.** 6-month window before official MCP Registry (Q4 2026) may commoditize quality audits. |

**See [detailed section below](#recommended-pivot-mcp-developer-tools) for full breakdown.**

### Rank 2: MCP Server Testing — **STRONG, best as feature of Rank 1**
**Concept:** Automated testing/compliance checking for MCP servers.

| Factor | Assessment |
|--------|-----------|
| Market demand | **Real.** MCP Inspector is dev-time only. No production testing tool. Fragmented landscape (mcp-sec-audit, mcp-server-tester, MCPSafetyScanner — all experimental). |
| Competition | **Low but emerging.** Promptfoo does red teaming (now OpenAI-owned). Official MCP Registry plans quality audits for Q4 2026. |
| Reuse | **High.** Receipt infrastructure maps to test results. MCP publishing experience = deep protocol knowledge. |
| Revenue | **Medium.** CI/CD integration has clear value. |
| Risk | **High timing risk.** Q4 2026 official tooling could commoditize. |

**Verdict:** Don't build standalone — fold into MCP Dev Tools as a core feature.

### Rank 3: Agent Observability — **DO NOT PURSUE**
**Concept:** Lightweight agent trace/log platform.

| Factor | Assessment |
|--------|-----------|
| Market demand | **Huge** ($1B+ TAM) |
| Competition | **Fortress.** Langfuse (acquired by ClickHouse, 2K+ paying customers, 26M SDK installs/month, 19 of Fortune 50). Promptfoo (acquired by OpenAI, $86M, 350K users). LangSmith ($39/user/month). Datadog LLM Observability. Helicone. Arize Phoenix. |
| Reuse | **Low.** Completely different product requiring trace SDKs, dashboards, query interfaces, alerting. |
| Revenue | **Theoretically high, practically zero.** Cannot reach feature parity with free tiers of existing tools. |

**Verdict:** Unwinnable for a solo builder. The incumbents have $100M+ in backing.

### Rank 4: Agent Workflow SDK — **DO NOT PURSUE**
**Concept:** Combine ProofSlip + ContextCapsule into one lightweight agent SDK.

| Factor | Assessment |
|--------|-----------|
| Market demand | **Exists but saturated.** |
| Competition | **Overwhelming.** Mastra ($13M YC seed, 22K GitHub stars, 300K weekly npm downloads, PayPal/Adobe/Docker customers). Vercel AI SDK (most downloaded). OpenAI/Google ship free SDKs. CrewAI (44K GitHub stars). |
| Reuse | **Medium.** Some code reuse but fundamentally different product. |

**Verdict:** Competing against teams with 10-100x resources and existing audiences.

### Rank 5: Agent-to-Agent Trust Layer — **DO NOT PURSUE**
**Concept:** "A2A lite" — simpler cross-agent verification.

| Factor | Assessment |
|--------|-----------|
| Market demand | **Exists at enterprise level.** |
| Competition | **Institutional.** A2A = Google + IBM + Linux Foundation + 150 orgs. Cryptographic signing, Agent Cards, SDKs in 4 languages. |
| Reuse | **Low.** Completely different security/identity domain. |

**Verdict:** "Lite version of an open standard" almost never wins. Enterprise buyers adopt the backed standard.

---

## Recommended Pivot: MCP Developer Tools

### The Opportunity

The MCP ecosystem is transitioning from "interesting experiment" to "boring production standard." This is exactly when developer tools become critical and valuable. The 2026 MCP roadmap explicitly calls out gaps in:

- Standardized audit trails
- Configuration portability across clients
- Enterprise auth patterns
- Quality/compliance checking
- Gateway behavior standards

### What Doesn't Exist Yet (Your Openings)

1. **MCP Server Health Monitoring** — uptime/health dashboard for your MCP servers. Not a gateway, just monitoring. No dedicated product exists.

2. **MCP Config Portability** — configure once, export for Claude Desktop, Cursor, VS Code, Windsurf, etc. Explicit gap in official roadmap.

3. **MCP Server Linting** — validate tool definitions, schema compliance, security posture, error handling. The ESLint for MCP servers.

4. **MCP Tool Call Audit Logger** — lightweight middleware capturing every tool call with structured data. Not a platform, just the capture layer.

### Suggested Product Shape

```
mcp-doctor (working name)
├── CLI (free, open source)
│   ├── mcp-doctor lint     — check server against best practices
│   ├── mcp-doctor test     — run compliance + integration tests
│   ├── mcp-doctor config   — generate configs for all clients
│   └── mcp-doctor check    — health/uptime probe
├── Hosted Dashboard (paid, $10-50/month)
│   ├── Monitoring history
│   ├── Team access
│   ├── CI/CD integration
│   └── Alerting
└── Content (free, for acquisition)
    ├── "MCP Server Production Readiness" guide
    └── Best practices documentation
```

### Why This Wins

| Factor | Why It Works |
|--------|-------------|
| **Skills transfer** | MCP protocol knowledge, npm publishing, TypeScript, Vercel — all reusable |
| **Existing network** | You know every registry, how to publish, how discovery works |
| **Indie-scale** | A CLI tool is achievable solo. Dashboard is a natural paid upsell. |
| **Clear acquisition** | `npx mcp-doctor lint` → registry listings → community engagement → content |
| **Revenue path** | Free CLI → paid dashboard. Micro-SaaS ($5-50K MRR achievable) |
| **Timing** | 6-month window before official MCP Registry quality audits (Q4 2026) |

### Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Official tooling catches up | Ship fast, build community, own the "production readiness" narrative |
| MCP ecosystem consolidates | Focus on the quality layer that gateways won't build |
| Solo builder bandwidth | Start with ONE feature (lint), nail it, expand |
| Timing pressure | MVP in 4-6 weeks, iterate from real feedback |

### User Acquisition Path

1. **Week 1-4:** Ship `mcp-doctor lint` as open-source CLI
2. **Week 2-3:** List on Smithery, Glama, npm — you know the playbook
3. **Week 3-4:** Write "MCP Server Production Readiness Checklist" — genuine content gap
4. **Week 4-8:** Engage MCP Discord/GitHub, help people, link to tool
5. **Month 3+:** Launch hosted dashboard for monitoring/history
6. **Month 4+:** CI/CD integration (GitHub Action)

### What to Do with ProofSlip

- **Keep the domain** — redirect to new product or archive
- **Keep the infrastructure** — Vercel, Neon, Hono patterns transfer directly
- **Keep the packages** — low maintenance, no reason to unpublish
- **Sunset active development** — no more features, just keep it running
- **Reference in portfolio** — demonstrates API design, testing, publishing skills

---

## Validation Results: MCP Dev Tools

> The initial recommendation was "MCP Developer Tools — a broad CLI toolkit." Running the pre-build validation checklist against this idea revealed a more nuanced picture. **The pain is real. The space is more crowded than expected. The viable wedge is narrower than initially scoped.**

### Checklist Results

#### Phase 1: Problem Validation

- [x] **Search for demand in user words.** STRONG PASS.
  - 127 issues in MCP spec repo mention testing/conformance
  - 724 issues in MCP servers repo mention testing/quality/validation
  - 776 issues on MCP Inspector (211 open)
  - Issue #1990 explicitly requests an official conformance test suite (open since Dec 2025, unresolved)
  - Cursor Forum flooded with "MCP server not working" / "tools not showing up" / "works in X but not Y"
  - HN thread "Everything wrong with MCP" + "Stop Vibe Testing Your MCP Server"
  - 9+ Show HN posts for MCP testing tools in the past year

- [x] **Map existing solutions.** MIXED — more competition than expected.

  **Tier 1 — Real adoption:**
  | Tool | Category | Weekly Downloads |
  |------|----------|-----------------|
  | MCP Inspector (official) | Debug/Test | 132K |
  | openapi-mcp-generator | Code Gen | 18K |
  | @modelcontextprotocol/sdk | SDK | 29.5M (includes consumers) |

  **Tier 2 — Growing:**
  | Tool | Category | Downloads/Stars |
  |------|----------|-----------------|
  | @gleanwork/mcp-server-tester | Automated Testing | 585/wk, heading toward 1.0 |
  | MCPCat | Monitoring/Analytics | 642/wk, OTel export |
  | Snyk agent-scan (ex-Invariant) | Security | Acquired by Snyk, RSA 2026 |
  | Cisco mcp-scanner | Security | 830 GitHub stars |
  | mcpevals.io | LLM-based eval scoring | GitHub Action CI/CD |
  | mcp-tef (Stacklok) | Alignment/Linting | Open source |

  **Security is OVERCROWDED:** 7+ tools (Snyk, Cisco, Promptfoo/OpenAI, MCPSafetyScanner, mcpscan.ai, mcp-guardian, @agentscore). Do NOT enter security.

- [x] **Check framework built-ins.** PASS — no framework solves this.
  - Official MCP SDK has zero testing helpers
  - Official Inspector is manual/interactive only — no CI integration
  - Official docs have NO guidance on unit testing, linting, or config validation
  - Official 2026 roadmap focuses on transport/auth/governance, not developer tooling

- [x] **Identify the vocabulary.** PASS.
  - **Tier 1 (dominant):** "MCP error -32000", "MCP server not working", "tools not showing up"
  - **Tier 2 (config):** wrong key (`servers` vs `mcpServers`), "spawn npx ENOENT", silent failures
  - **Tier 3 (schema):** "schema validation error", "input_schema does not support oneOf" — Claude Code v2.0.21+ broke working servers with strict validation
  - **Tier 4 (gotchas):** "console.log breaks the server" (stdout corruption), tool descriptions under 20 chars silently ignored
  - **Quality tooling vocabulary:** "inspect", "debug", "validate", "eval", "lint" — no single term dominates

- [x] **Test the "feature or product?" question.** CONDITIONAL PASS.
  - The broad "MCP testing" space could become a feature of the official SDK — Anthropic is already tightening client-side validation
  - But **cross-client compatibility testing** is inherently a third-party concern — Anthropic won't test Cursor's config format
  - And **tool description quality for LLM consumption** is subjective/opinionated — better as an independent linter

#### Phase 2: Market Validation

- [ ] **Find 3 people who'd pay.** NOT YET DONE. Requires community engagement.

- [x] **Size the niche.** ADEQUATE for micro-SaaS.
  - MCP Inspector: 400K-640K downloads/month (proxy for active server developers)
  - Estimated active MCP server developers: **30,000-100,000 worldwide**
  - 11,150+ servers on PulseMCP, growing 301/month (5x growth in 5 months)
  - ~5,000-7,000 unique server authors
  - 39% from companies with 11-50 employees (growth-stage startups)
  - Enterprise internally: Block, Bloomberg, Amazon, Pinterest in production
  - Qualys called MCP servers "the new Shadow IT" (March 2026)

- [x] **Check the timing.** NARROW WINDOW.
  - Official MCP Registry with quality audits: Q4 2026 (~6 months)
  - Anthropic tightening client-side schema validation NOW (Claude Code v2.0.21+)
  - BUT: official tooling focuses on protocol compliance, not developer experience or cross-client compat

- [x] **Map the acquisition path.** CLEAR.
  - MCP Discord, GitHub issues, Cursor Forum, HN Show HN
  - Content: "MCP Server Production Readiness Checklist" (genuine gap)
  - CLI distribution: `npx` one-liner, registry listings

- [x] **Define the retention hook.** WEAK for CLI, STRONG for dashboard.
  - CLI: run-once tool, no retention (like ESLint — you run it and move on)
  - Dashboard: monitoring, CI badge, history, team access — recurring engagement
  - GitHub Action: runs on every PR — automatic recurring usage

### Key Findings That Changed the Recommendation

1. **"MCP doctor" as a broad toolkit is too late.** 9+ Show HN posts for MCP testing tools. MCPJam Inspector (1,836 stars), Glean's mcp-server-tester, mcpevals.io, Stacklok's mcp-tef — the general space is fragmenting fast.

2. **Security is a no-go zone.** Snyk (acquired Invariant), Cisco, Promptfoo/OpenAI — well-funded teams with enterprise reach. Don't touch it.

3. **Two gaps nobody owns:**
   - **Cross-client compatibility testing** — "works in Claude but not Cursor" is the #1 end-user complaint. The Inspector tests in isolation. Nobody tests across the client matrix.
   - **Tool description quality for LLM consumption** — nobody lints whether descriptions will actually work well with AI clients (too long, ambiguous, missing examples, token budget impact). Claude Code's new strict validation is breaking servers because authors didn't know the rules.

4. **The biggest risk is Anthropic.** They're already tightening validation at the client level. If they ship a comprehensive server validator, it commoditizes the space overnight.

---

## Validated Pivot Recommendation

### The Refined Idea: MCP Compatibility Checker

**One specific problem:** "My MCP server works in Claude Desktop but breaks in Cursor / VS Code / Windsurf."

This is the highest-volume, highest-frustration pain point that nobody owns. Cross-client compatibility is inherently a third-party concern — Anthropic won't test Cursor's quirks, Cursor won't test Claude Desktop's quirks.

### Why This Specific Wedge

| Factor | Assessment |
|--------|-----------|
| **Pain volume** | #1 complaint on Cursor Forum, widespread on GitHub |
| **Competition** | Zero. Every tool tests against one client's expectations. Nobody tests the matrix. |
| **Anthropic risk** | Low. Cross-client compat is inherently third-party territory. |
| **Skills transfer** | High. You've published an MCP server and configured it for multiple clients. |
| **Cold start** | Works at zero users. Runs locally against your own server. |
| **Vocabulary match** | "Works in X but not Y" — developers already describe this problem exactly this way. |

### What It Does (MVP)

```
npx mcp-compat check ./my-server

✓ Protocol compliance (JSON-RPC, tool schemas)
✓ Claude Desktop compatibility
✓ Cursor compatibility  
✓ VS Code Copilot compatibility
✗ Windsurf — tool description too short (min 20 chars)
✗ Cursor — config key should be "mcpServers" not "servers"
⚠ Schema uses oneOf — not supported in Claude Code v2.0.21+

3 issues found. Run `mcp-compat fix` for suggestions.
```

### Feature Ladder

| Phase | Feature | Monetization |
|-------|---------|-------------|
| **MVP (week 1-4)** | CLI: lint server against known client quirks | Free, open source |
| **Phase 2 (month 2-3)** | GitHub Action: run on every PR, badge in README | Free (adoption driver) |
| **Phase 3 (month 3-4)** | Dashboard: history, team view, client update alerts | $15-30/month |
| **Phase 4 (month 4+)** | Registry integration: "Verified compatible" badge on Smithery/Glama | Partnership revenue |

### Revenue Projection (Micro-SaaS Target)

| Scenario | 12-month ARR | Assumptions |
|----------|-------------|-------------|
| Pessimistic | $0 | CLI-only, no conversion to paid |
| Realistic | $3-8K | 50-100 dashboard users at $15/mo, 5-10% conversion |
| Optimistic | $15-30K | 200+ dashboard users, registry partnerships |

This isn't "get rich" money. It's "covers costs and builds reputation" money — which is the right goal for a solo builder learning the ecosystem.

### What to Do with ProofSlip and ContextCapsule

- **Keep running, stop building.** No new features. Maintenance only.
- **Keep the domains** — they're assets even if dormant.
- **Keep the packages published** — low maintenance, good portfolio pieces.
- **Cross-reference in portfolio** — "I built and published APIs to npm, PyPI, and 6 registries" is strong signal to future employers/collaborators.

### Validation Step Results

- [ ] **Post in MCP Discord:** "Building a cross-client compat checker for MCP servers — would this help you?" Gauge response.
- [ ] **Find 3 server authors** who've experienced the "works in X but not Y" problem. Ask if they'd use this.
- [x] **Catalog the client quirks.** **RESULT: 47 substantive quirks across 25 categories.** Threshold was 10. This is a real, thick problem. See appendix below.

### Appendix: Cross-Client Quirk Catalog (47 Items)

Clients covered: Claude Desktop, Claude Code, Cursor, VS Code Copilot, Windsurf, Zed, Continue.dev, Cline, OpenAI Codex, Copilot CLI.

#### Config Format Differences (Silent Failures)

| Category | Quirk Count | Highest-Impact Example |
|----------|-------------|----------------------|
| **Config root key** | 4 | VS Code uses `servers`, everyone else uses `mcpServers` — wrong key = silent ignore |
| **Config file path** | 3 | Claude Code ignores `mcpServers` if placed in `settings.json` instead of `.claude.json` |
| **Config format** | 2 | Continue.dev uses array `[]` not object `{}`; Codex uses TOML |
| **Env var syntax** | 3 | 6 different interpolation syntaxes; Claude Desktop has NO expansion |
| **VS Code type field** | 1 | Missing `"type"` field causes VS Code to misinterpret URL as subprocess |
| **JSON syntax errors** | 2 | One trailing comma kills ALL servers, no indication which line |

#### Protocol & Schema Differences

| Category | Quirk Count | Highest-Impact Example |
|----------|-------------|----------------------|
| **Schema validation** | 2 | Claude Code v2.0.21+ rejects `oneOf`/`allOf`/`anyOf` — breaks Perplexity MCP and hundreds of others |
| **Tool name validation** | 3 | Claude API rejects hyphens in tool names; MCP spec allows them |
| **Tool count limits** | 2 | Cursor: 40 tools silent cap; Windsurf: 100 tools silent drop |
| **Transport support** | 3 | Claude Desktop (local) = stdio ONLY; Zed = stdio ONLY |
| **Capability support** | 3 | Only VS Code supports sampling; Cursor lacks resources |
| **Timeout defaults** | 1 | CrewAI 30s vs TypeScript SDK 60s — cold starts fail in one, not the other |
| **list_changed** | 1 | Dynamic tool registration works in Claude Code, fails elsewhere |

#### Platform & Runtime Issues

| Category | Quirk Count | Highest-Impact Example |
|----------|-------------|----------------------|
| **Windows npx/cmd** | 2 | `"command": "npx"` silently fails on Windows (needs `cmd /c npx`) |
| **PATH inheritance** | 1 | macOS GUI apps don't inherit nvm/pyenv/homebrew paths |
| **stdout contamination** | 1 | `console.log()` kills stdio connection with error -32000 |
| **PowerShell silent fail** | 1 | `.mcp.json` completely ignored under PowerShell |
| **npx -y flag** | 1 | Missing `-y` causes stdin hang (prompt conflicts with JSON-RPC) |

#### UX & Behavior Differences

| Category | Quirk Count | Highest-Impact Example |
|----------|-------------|----------------------|
| **Config reload** | 2 | Claude Desktop: window close ≠ quit — old config persists |
| **Auto-approve config** | 3 | Different key names (`alwaysAllow` vs `autoApprove`); Claude Code has no option |
| **Authentication** | 2 | Claude Code's `headersHelper` is unique; VS Code's interactive `${input:}` is unique |
| **Agent mode** | 1 | VS Code defaults to "Ask" mode — MCP tools invisible until switching to "Agent" |
| **VS Code sandbox** | 1 | Unique filesystem/network sandboxing — configs not portable |
| **Windsurf disabledTools** | 1 | Unique per-tool disable array — configs not portable |

#### Top 6 Highest-Impact Checks for MVP

1. **Config key/path validator** — "this config works in Cursor but will be silently ignored by VS Code"
2. **Schema linter** — catches `oneOf`/`allOf`/`anyOf` that break Claude Code
3. **Tool name validator** — flags hyphens, dots, length >64, colons
4. **Transport compat matrix** — "this server uses SSE but your target client only supports stdio"
5. **Windows config fixer** — adds `cmd /c` wrapper, escapes backslashes
6. **Cross-client config converter** — translates between JSON formats, TOML, YAML

#### Sources for Quirk Catalog

- [Understanding MCP Across Platforms](https://dev.to/darkmavis1980/understanding-mcp-servers-across-different-platforms-claude-desktop-vs-vs-code-vs-cursor-4opk)
- [MCP Troubleshooting Guide](https://agenticmarket.dev/blog/mcp-server-not-working)
- [Complete Guide to MCP Config Files](https://mcpplaygroundonline.com/blog/complete-guide-mcp-config-files-claude-desktop-cursor-lovable)
- [Claude Code #10606 — Strict Schema Validation](https://github.com/anthropics/claude-code/issues/10606)
- [Claude Code #24477 — settings.json Silently Ignored](https://github.com/anthropics/claude-code/issues/24477)
- [Claude Code #4158 — /c Flag Mangling on Windows](https://github.com/anthropics/claude-code/issues/4158)
- [Claude Code #11597 — PowerShell Silent Failure](https://github.com/anthropics/claude-code/issues/11597)
- [MCP Spec #986 — Tool Name Format](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/986)
- [Docker MCP Gateway #228 — Colons in Tool Names](https://github.com/docker/mcp-gateway/issues/228)
- [Zed #42692 — Backslash Corruption](https://github.com/zed-industries/zed/issues/42692)
- [VS Code MCP Configuration](https://code.visualstudio.com/docs/copilot/reference/mcp-configuration)
- [Windsurf MCP Docs](https://docs.windsurf.com/windsurf/cascade/mcp)
- [Cursor MCP Docs](https://docs.cursor.com/context/model-context-protocol)
- [Continue.dev MCP Setup](https://docs.continue.dev/customize/deep-dives/mcp)
- [Codex MCP Config](https://developers.openai.com/codex/mcp)
- [Cursor Forum — Tool Limit](https://forum.cursor.com/t/increase-the-mcp-tool/69194)
- [modelcontextprotocol/servers#3460 — npx on Windows](https://github.com/modelcontextprotocol/servers/issues/3460)

---

## Lessons Learned

### For Future Projects

1. **Validate demand before building.** Search for people asking for the solution in their own words. If nobody is searching for your category, you'll spend all your energy on education instead of adoption.

2. **Match market vocabulary.** ProofSlip's "receipt" metaphor was intuitive but didn't match how developers describe the pain ("state management", "checkpointing", "durable execution"). Name your product in the language your users already use.

3. **Features beat products for narrow problems.** Verification is a feature of orchestration platforms, not a standalone product. Before building a product, ask: "Is this a product or a feature?" If every platform includes it as a checkbox, it's a feature.

4. **Registry presence ≠ distribution.** Being listed on 6 registries with 12,000+ competitors is table stakes. Distribution requires a forcing function — content, community, or a viral loop that actually works at zero users.

5. **Cold start kills virality assumptions.** Built-in virality (verify_url breadcrumbs) only works when someone creates the first receipt. Always ask: "What happens at zero users? Does the growth loop still turn?"

6. **Free tiers need a ceiling that matters.** 500 receipts/month with no dashboard means users never hit friction. The free tier should be generous enough to prove value but constrained enough to create upgrade pressure.

7. **Solo builders win in niches, not categories.** Category creation requires massive education budgets. Enter existing categories with better execution in a narrow slice.

8. **Transactional products need retention hooks.** Create → verify → expire has no engagement loop. Future products should include dashboards, history, notifications, or community — something that pulls users back.

---

## Pre-Build Validation Checklist

**Use this before building ANY future product:**

### Phase 1: Problem Validation (Before Writing Code)

- [ ] **Search for demand in user words.** Find 10+ forum posts, tweets, or GitHub issues where people describe the pain in THEIR vocabulary. If you can't find them, the pain isn't acute enough.
- [ ] **Map existing solutions.** For each demand signal, note what the person ended up using. If they all used the same tool, that tool owns the problem.
- [ ] **Check framework built-ins.** Does LangGraph/CrewAI/Temporal/etc. already solve this as a feature? If yes, your product competes with free.
- [ ] **Identify the vocabulary.** What words do developers use to describe this problem? Your product name and marketing must use THEIR words.
- [ ] **Test the "feature or product?" question.** If every major platform could add this as a checkbox feature, it's not a product.

### Phase 2: Market Validation (Before Building Infra)

- [ ] **Find 3 people who'd pay.** Not "interesting idea" — actual "I'd pay $X/month for this." Can be informal conversations.
- [ ] **Size the niche.** How many developers have this specific problem? Use npm download counts, GitHub stars, forum activity as proxies.
- [ ] **Check the timing.** Is there an official solution coming? (e.g., MCP Registry Q4 2026). If yes, you have a window, not a moat.
- [ ] **Map the acquisition path.** Where do your target users hang out? How will they find you? "Agents will discover us" is not an acquisition path.
- [ ] **Define the retention hook.** What brings users back after first use? If the answer is "nothing until they need it again," you have a retention problem.

### Phase 3: MVP Scoping (Before Building Features)

- [ ] **One feature, one command.** What's the single thing that makes someone say "I need this"? Build only that.
- [ ] **Day-one content plan.** What guide/tutorial/post will you write that genuinely helps people AND leads them to your tool?
- [ ] **Cold start plan.** How does the product deliver value with zero other users? No virality assumptions.
- [ ] **Pricing friction.** What's the free tier ceiling? Where does upgrade pressure naturally occur?
- [ ] **4-week MVP deadline.** If you can't ship an MVP in 4 weeks, the scope is too large.

---

## References & Sources

### Market Research
- [Temporal for AI](https://temporal.io/solutions/ai)
- [Inngest AgentKit](https://www.inngest.com/blog/building-agentic-workflows-that-can-query)
- [LangGraph 1.0](https://medium.com/@romerorico.hugo/langgraph-1-0-released-no-breaking-changes-all-the-hard-won-lessons-8939d500ca7c)
- [CrewAI Guardrails](https://www.analyticsvidhya.com/blog/2025/11/introduction-to-task-guardrails-in-crewai/)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/handoffs/)
- [A2A Protocol — Linux Foundation](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project)

### MCP Ecosystem
- [PulseMCP Statistics](https://www.pulsemcp.com/statistics) — 11,150+ servers
- [Bloomberry: 1,400 MCP Servers Analysis](https://bloomberry.com/blog/we-analyzed-1400-mcp-servers-heres-what-we-learned/)
- [MCP-Zero: Active Tool Discovery](https://arxiv.org/abs/2506.01056) — validates autonomous discovery
- [Tool Discovery in 2026](https://blog.icme.io/getting-found-by-agents-a-builders-guide-to-tool-discovery-in-2026/)
- [MCP Adoption Statistics](https://mcpmanager.ai/blog/mcp-adoption-statistics/)
- [a16z MCP Deep Dive](https://a16z.com/a-deep-dive-into-mcp-and-the-future-of-ai-tooling/)

### Competitor Intelligence
- [Mastra $13M Seed](https://technews180.com/funding-news/mastra-raises-13m-seed-for-typescript-ai-framework/) — 22K GitHub stars, 300K weekly npm
- [ClickHouse Acquires Langfuse](https://clickhouse.com/blog/clickhouse-acquires-langfuse-open-source-llm-observability) — 2K+ paying customers
- [Promptfoo / OpenAI Acquisition](https://www.promptfoo.dev/blog/series-a-announcement/) — ~$86M, 350K users
- [AI Observability Tools Comparison](https://www.morphllm.com/ai-observability)
- [AI Agent Framework Comparison](https://www.morphllm.com/ai-agent-framework)

### MCP Tooling Landscape (Validation Phase)
- [MCP Inspector GitHub](https://github.com/modelcontextprotocol/inspector) — 9,344 stars, 608K downloads/mo
- [MCPJam Inspector](https://github.com/nicobailey/mcpjam-inspector) — 1,836 stars
- [Glean mcp-server-tester](https://github.com/gleanwork/mcp-server-tester) — 585/wk, heading toward 1.0
- [MCPCat](https://mcpcat.io/) — session replay + analytics, 642/wk
- [Snyk Agent Scan (ex-Invariant)](https://github.com/snyk/agent-scan) — acquired by Snyk, RSA 2026
- [Cisco MCP Scanner](https://github.com/cisco-ai-defense/mcp-scanner) — 830 stars
- [mcpevals.io](https://www.mcpevals.io/) — LLM-based eval scoring + GitHub Action
- [Stacklok mcp-tef](https://github.com/StacklokLabs/mcp-tef) — alignment/linting
- [AgentSeal: 1,808 Servers Scanned](https://agentseal.org/blog/mcp-server-security-findings) — 66% had security findings
- [Claude Code Schema Validation Issue #10606](https://github.com/anthropics/claude-code/issues/10606) — strict validation broke working servers
- [MCP Servers: The New Shadow IT (Qualys)](https://blog.qualys.com/product-tech/2026/03/19/mcp-servers-shadow-it-ai-qualys-totalai-2026)
- [MCP Troubleshooting Guide](https://agenticmarket.dev/blog/mcp-server-not-working)
- [MCP Error -32000 Troubleshooting](https://mcpplaygroundonline.com/blog/mcp-server-troubleshooting-common-errors-fix)

### Strategic Context
- [MCP 2026 Roadmap](https://workos.com/blog/2026-mcp-roadmap-enterprise-readiness)
- [MCP Growing Pains — The New Stack](https://thenewstack.io/model-context-protocol-roadmap-2026/)
- [Agent Protocol Ecosystem Map](https://www.digitalapplied.com/blog/ai-agent-protocol-ecosystem-map-2026-mcp-a2a-acp-ucp)
- [Agents Need Durable Workflows](https://stack.convex.dev/durable-workflows-and-strong-guarantees)
- [Agentic AI Market Size](https://www.marketsandmarkets.com/Market-Reports/agentic-ai-market-208190735.html) — $5-8B (2025) → $180-200B (2033)

---

## Plan Summary

### Where We Started
ProofSlip — an ephemeral receipt API for agent workflows. Well-built, zero users. Overall viability: **4/10**.

### What We Found
- The market solves agent verification through orchestration platforms and framework-native checkpointing, not standalone APIs
- ProofSlip's "receipt" vocabulary doesn't match how developers describe the pain
- Registry presence (6 listings, 9 discovery endpoints) is table stakes with 12,000+ MCP servers
- The "agents will find us" thesis is technically valid but insufficient for cold start

### Five Pivots Evaluated

| Pivot | Verdict | Reason |
|-------|---------|--------|
| **MCP Dev Tools** | Best option | Real gaps, skills transfer, indie-achievable |
| MCP Testing | Fold into above | Strong but better as feature |
| Observability | No | Langfuse/Promptfoo fortress positions |
| Workflow SDK | No | Mastra ($13M, 300K weekly npm) |
| A2A Trust | No | Google + Linux Foundation + 150 orgs |

### Validation Narrowed the Pivot

Running the pre-build checklist against "MCP Dev Tools" revealed:
- **General MCP testing is already crowded** — 9+ Show HN posts, MCPJam (1,836 stars), Glean's tester, mcpevals.io
- **Security is a no-go** — Snyk, Cisco, Promptfoo/OpenAI own it
- **Cross-client compatibility is unowned** — 47 documented quirks, zero dedicated tools, #1 end-user complaint

### The Validated Idea

**`mcp-compat` — Cross-client MCP compatibility checker.**

"My MCP server works in Claude Desktop but breaks in Cursor / VS Code / Windsurf."

- 47 substantive quirks across 25 categories and 10+ clients
- Zero competition (every tool tests against one client; nobody tests the matrix)
- Low Anthropic risk (cross-client compat is inherently third-party territory)
- Works at zero users (runs locally against your own server)
- Skills transfer directly from ProofSlip (MCP protocol knowledge, npm publishing, TypeScript)

### Action Plan

| Step | What | When |
|------|------|------|
| 1 | Post in MCP Discord — gauge interest | This week |
| 2 | Find 3 server authors who've hit "works in X not Y" | This week |
| 3 | If steps 1-2 validate: publish quirk catalog as blog post | Week 2 |
| 4 | Build MVP CLI (`npx mcp-compat check`) | Weeks 2-4 |
| 5 | List on npm, Smithery, Glama | Week 4 |
| 6 | GitHub Action for CI | Month 2-3 |
| 7 | Paid dashboard (monitoring, history, team) | Month 3-4 |

### What to Do with ProofSlip
- Keep running, stop building
- Keep domains, packages, and registry listings
- Reference in portfolio (demonstrates API design, npm/PyPI publishing, MCP ecosystem skills)

### Key Lesson
**Validate before you build.** This entire document exists because ProofSlip was built before validating that the market wanted a standalone receipt API. The pre-build validation checklist (Section 13) is the most reusable artifact here — use it for every future idea.

---

*Generated 2026-04-06. This document should be treated as a point-in-time snapshot — market conditions in the MCP/agent ecosystem change on ~3-month cycles.*
