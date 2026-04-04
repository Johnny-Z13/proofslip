# ProofSlip Growth Thesis

## The Bet

Agents are getting smarter at discovering the tools they need. As agentic workflows become more autonomous, agents will encounter a recurring problem: **how do I know what already happened before I decide what to do next?**

ProofSlip is the answer to that question. Ephemeral, verifiable receipts that prove actions happened.

The bet is: **if ProofSlip is plumbed into enough discovery surfaces, agents will find it themselves.** We don't need to market to developers. We need to be present where agents look for tools.

## Why Ecosystem Saturation Beats Marketing

Traditional dev tool marketing: write blog posts, grind Twitter, hope for Hacker News. That's a broadcast game that requires audience, consistency, and time.

ProofSlip has a different advantage: **built-in virality through the protocol itself.**

1. Agent A uses ProofSlip to create a receipt
2. That receipt ID gets passed to Agent B (via ContextCapsule, tool output, or context)
3. Agent B needs to verify the receipt — discovers ProofSlip
4. Agent B's developer sees ProofSlip in their agent's tool calls
5. Developer integrates ProofSlip into more workflows

The receipt *is* the marketing. Every `verify_url` is a breadcrumb that leads back to ProofSlip.

## Why Not a Generic Utility Library

GPT suggested building a `safe-step` npm package — a retry-safe wrapper that secretly uses ProofSlip under the hood. We rejected this because:

- **It competes with solved problems.** Stripe has idempotency keys. Temporal has workflow deduplication. Bull has job deduplication. Generic retry-safety is a crowded space.
- **It requires npm SEO grind** — that's social media with a different name.
- **It positions ProofSlip as a utility, not a protocol.** We want ProofSlip to be the standard verification primitive for agent workflows, not a convenience wrapper.
- **"Powered by ProofSlip" funnels are weak.** Most devs never click through.

## The Actual Position

ProofSlip is not a retry library. It's the **verification layer for agentic workflows.**

- **ProofSlip** (evidential) — "Here's what actually happened, and you can verify it."
- **ContextCapsule** (navigational) — "Here's the situation, what matters, and what should happen next."

Together they form two primitives that make multi-agent handoffs reliable.

## Who Finds Us

We're not targeting generic JS/TS backend devs. Our users are:

1. **Agent orchestration devs** — building with LangChain, CrewAI, AutoGen, LangGraph. They need verification between pipeline steps.
2. **MCP-native tool builders** — the Claude/Cursor/Windsurf ecosystem where MCP tools are first-class.
3. **Agents themselves** — increasingly capable of searching tool registries and discovering what they need.

## How Discovery Works

Agents and frameworks discover tools through:

- **MCP registries** (Smithery, mcp.run, framework MCP configs)
- **Tool marketplace listings** (Composio, LangChain hub)
- **LLM context files** (llms.txt, served at well-known URLs)
- **OpenAPI specs** (indexed by agent frameworks)
- **Agent protocol manifests** (agent.json, ai-plugin.json)

We've already built all the machine-readable discovery endpoints. The strategy is to **push these into every registry and listing that exists**, then let the network effects compound.

## Success Looks Like

Not vanity metrics. Success is:

- Receipts being created by agents we didn't directly onboard
- `verify_url` hits from agent frameworks we didn't build integrations for
- Developers finding ProofSlip because their agent suggested it
- ContextCapsule references appearing in workflows that chain with ProofSlip receipts

## Revenue Model

Free tier (500 receipts/month) is generous enough for experimentation. Revenue comes when workflows go to production and receipt volume scales. This is a usage-based API business — adoption first, monetization follows naturally.
