# Context Capsule Repositioning Plan: Cross-Agent Handoff

Status: implemented locally; validation and publication pending
Implementation, product, and launch owner: Codex

## 1. Outcome

Reposition Context Capsule from a generic hosted execution-context API into a local-first open-source handoff utility for coding agents.

Core promise:

> Move a coding task between AI agents without starting over.

Primary interface:

- The `contextcapsule-handoff` Agent Skill authors a compact, repository-aware capsule.
- Its bundled `capture`, `create`, and `resume` commands make repository inspection, rendering, and freshness classification deterministic.

The hosted service remains available as an optional sharing layer. It is not required for the first useful result.

## 2. Target User and Job

Primary user:

- Developers switching between Codex, Claude Code, Cursor, and similar tools.
- Developers ending a long session and resuming later.
- Teams handing a partially completed coding task to another person or agent.

Job to be done:

> When I stop or switch agents mid-task, capture the minimum reliable execution context so the next agent can continue against the correct repository state.

## 3. MVP Boundary

### Included

- Agent Skill containing `/handoff` and `/resume` procedures and deterministic helper scripts.
- Local Markdown and JSON capsule output.
- Repository, remote, branch, commit, working-tree, changed-file, verification, blocker, decision, and next-action context.
- Staleness and mismatch checks on resume.
- Compatibility guidance for Codex, Claude Code, Cursor, and other Agent Skills-capable clients.
- Optional explicit upload to the existing hosted service for non-sensitive sharing.
- Clear integration point for ProofSlip references.

### Explicitly excluded

- Long-term memory, vector search, transcripts, knowledge bases, or retrieval.
- Generic workflow orchestration, checkpoints, task queues, or agent runtime state.
- Automatic public upload.
- Automatic commits or modifications to the user's repository.
- Team dashboard, inbox, SSO, billing, or enterprise policy features.
- Further schema expansion unless required by the concrete handoff workflow.
- Claims that expiry alone makes context fresh.

## 4. Product Contract

### `/handoff`

The command must:

1. Confirm the repository root and current working directory.
2. Read repository state without changing it.
3. Capture the task objective and present status.
4. Capture decisions, constraints, blockers, changed files, verification performed, and the exact next action.
5. Record repository identity, branch, HEAD commit, and a bounded working-tree fingerprint.
6. Produce a human-readable Markdown handoff and a machine-readable JSON capsule.
7. Warn before including likely secrets, credentials, environment values, customer data, or large source excerpts.
8. Ask before any optional hosted upload.

### `/resume`

The command must:

1. Load a local capsule or explicitly supplied capsule link.
2. Resolve and verify the current repository root.
3. Compare repository remote, branch, HEAD, working-tree state, and capsule age.
4. Classify the capsule as `compatible`, `stale`, `mismatched`, or `unverifiable`.
5. Present discrepancies before allowing the agent to rely on the capsule.
6. Restate the objective, constraints, blockers, completed verification, and next action.
7. Treat completion claims as claims unless a referenced ProofSlip independently verifies them.

## 5. Capsule Format

Replace the product emphasis on generic `memory`, `state`, and `intent` lanes with one canonical coding-handoff shape.

Suggested schema:

```json
{
  "schema_version": "coding-handoff/v1",
  "capsule_id": "cap_...",
  "created_at": "...",
  "expires_at": "...",
  "objective": "Fix the signup and release-proof flow",
  "status_summary": "Canonical-domain auth fixed; production email still needs verification",
  "repository": {
    "remote": "github.com/owner/repo",
    "root_name": "repo",
    "branch": "main",
    "head_sha": "...",
    "working_tree": "dirty",
    "fingerprint": "..."
  },
  "decisions": [],
  "constraints": [],
  "changed_files": [],
  "verification": [],
  "blockers": [],
  "next_action": "Run the production signup smoke test",
  "references": {
    "proofslip_ids": [],
    "issues": [],
    "pull_requests": []
  }
}
```

Rules:

- Keep the canonical JSON small and bounded.
- Do not include full diffs, transcripts, environment files, tokens, or source archives.
- File paths must be repository-relative.
- Verification entries must identify what was run, result, timestamp, and whether it was observed or merely reported.
- The Markdown view should be generated from the JSON contract, not maintained independently.

## 6. Local Storage

Default output:

- `.contextcapsule/latest.json`
- `.contextcapsule/latest.md`

Behavior:

- Do not commit these files automatically.
- Provide an installation option to add `.contextcapsule/` to the local exclude file or project `.gitignore`, but require approval before editing repository files.
- Allow an explicit output path for teams that intentionally commit handoffs.
- Use atomic writes and preserve the previous capsule as a bounded backup when replacing `latest`.

The Skill must remain useful even if contextcapsule.ai is offline.

## 7. Staleness and Safety

Expiry is a hint, not proof of freshness.

On resume, compare:

- Repository remote identity.
- Branch.
- Recorded HEAD versus current HEAD.
- Whether recorded changed files still exist.
- Whether the working tree has diverged.
- Capsule age.
- Referenced issue or proof state when accessible.

Example result:

```text
STALE: repository advanced 4 commits after this capsule.
SAFE TO REUSE: objective and decisions.
RECHECK: changed files, test results, and next action.
```

Never silently inject a stale capsule into the next agent's context.

## 8. Agent Skill and Scripts

Maintain `.agents/skills/contextcapsule-handoff/SKILL.md` with small deterministic scripts for:

- Reading Git repository metadata.
- Building the bounded fingerprint.
- Validating the capsule schema.
- Rendering Markdown.
- Comparing a capsule with current repository state.
- Optionally uploading and fetching a hosted capsule.

Target install route:

```bash
npx skills add Johnny-Z13/context-capsule --skill contextcapsule-handoff
```

The Skill instructions must:

- Use the scripts for deterministic repository checks.
- Ask the agent for only missing semantic information such as decisions or blockers.
- Never infer that unverified tests passed or work was deployed.
- Never upload without explicit approval.
- Avoid exposing secrets in tool output.

## 9. Hosted API Plan

### Existing API

- Preserve current create/fetch endpoints during the experiment.
- Document them as optional hosted sharing, not the primary product.
- Keep existing capsules backward compatible.
- Accept the new `coding-handoff/v1` shape through a versioned field or dedicated endpoint only after the local format is stable.

### Security correction

The existing public-by-ID model is not suitable as the default for coding context.

Short-term:

- Make upload explicitly opt-in.
- Show a strong warning that anyone with the URL can fetch the content.
- Reject obvious secrets and dangerous fields where possible.
- Keep TTL short.

Post-validation:

- Add client-side encrypted capsules.
- Store ciphertext only.
- Put the decryption key in the URL fragment or local handoff token so the server does not receive it.
- Allow agents to fetch and decrypt using the Skill.

Do not build encrypted hosting before the local workflow gets external repeat use.

## 10. Website Plan

### Homepage

New hero:

> Switch coding agents without losing the thread.

Supporting line:

> Context Capsule captures the repo state, decisions, blockers, verification, and exact next action needed to continue in Codex, Claude Code, Cursor, or another coding agent.

Primary CTA:

- `Install the handoff Skill`

Secondary CTA:

- `See a Codex -> Claude Code handoff`

Do not make API-key signup the primary CTA.

Homepage sections:

1. A real before/after cross-agent handoff.
2. `/handoff` output.
3. `/resume` staleness check.
4. Local-first privacy explanation.
5. Optional hosted sharing.
6. ProofSlip integration as a small advanced section.
7. Open-source repository and contribution links.

Remove or demote broad claims about generic multi-agent workflow infrastructure, memory, token optimization, fork/join, human approval, and universal agent coordination.

### Capsule page

For `coding-handoff/v1`, show:

- Compatibility/staleness status when known.
- Objective and current status.
- Repository, branch, and commit.
- Decisions and constraints.
- Changed files.
- Verification performed.
- Blockers and next action.
- ProofSlip references in a separate evidence section.
- Security notice for public links.

## 11. README and Documentation Plan

Lead the README with a two-tool demonstration:

1. Run `/handoff` in one coding agent.
2. Run `/resume` in another.

Required sections:

- One-sentence promise.
- Install command.
- Local-first quick start.
- Example capsule.
- Staleness behavior.
- Privacy and secret handling.
- Optional hosted API.
- ProofSlip references.
- Compatibility matrix.
- Contributing and roadmap.

Reorganize docs so the generic REST API becomes an advanced option. Update `llms.txt`, `llms-full.txt`, OpenAPI, MCP metadata, package README, homepage, and repository description from the same canonical positioning.

Mark the previous schema and umbrella-brand plans as historical or superseded. Do not delete the learning.

## 12. MCP Package

- Keep `create_capsule`, `fetch_capsule`, and signup functional for existing users.
- Correct API key prefixes, canonical domains, and response shapes across package and API docs.
- Do not make MCP the primary install path for the new local-first workflow.
- Consider local handoff MCP tools only after the Skill is used externally; Skills are easier to distribute and better suited to filesystem-aware procedures.

## 13. Tests and Verification

Add tests for:

- Schema validation and size limits.
- Repository metadata collection.
- Clean, dirty, detached HEAD, missing remote, non-Git, shallow clone, and worktree cases.
- Compatible, stale, mismatched, and unverifiable resume classifications.
- Secret-pattern warnings and redaction.
- Markdown rendering from JSON.
- Local operation with the hosted service unavailable.
- Explicit upload consent boundary.
- Existing API backward compatibility.
- Website quick start and package install instructions.

Run a cross-client manual smoke test:

1. Create a handoff in Codex.
2. Resume it in Claude Code or Cursor.
3. Change the repository.
4. Resume again and confirm staleness is surfaced.

## 14. Instrumentation

Do not silently phone home from local scripts.

Measure:

- Skills directory install counts.
- GitHub stars, forks, issues, and contributions.
- Optional hosted capsule creation and fetches.
- Explicit opt-in anonymous events for `/handoff` and `/resume` success.
- External repositories that use hosted sharing in separate weeks.

Local-only use may remain unobservable. Open-source trust is more important than perfect analytics.

## 15. Launch Acceptance Criteria

The repositioned Context Capsule is ready to seed only when:

- A user can install the Skill with one command.
- `/handoff` works without an account or network.
- `/resume` detects a changed branch or commit and warns clearly.
- A real task can move between two supported coding agents.
- No repository files are changed without approval.
- Hosted upload is explicit and clearly described as public-by-link until encryption exists.
- The website and README lead with cross-agent coding handoff.
- The legacy hosted API still works.

## 16. Post-MVP Expansion Rules

Build encrypted hosted sharing only after at least three external projects use `/handoff` and `/resume` in two separate weeks.

Potential paid features, only after direct demand:

- Encrypted team handoff inbox.
- Access-controlled links.
- Team retention and search.
- Issue tracker and code-host integrations.
- Handoff policies and templates.
- SSO, audit, and managed deployment.

Do not attempt to monetize generic JSON storage.

## 17. Implementation Sequence

Execute after the active stabilization/V2 work has reached a safe commit. Do not discard or rewrite the current worktree to begin this plan.

1. Decide whether the nearly completed V2 changes are stabilization-only or should be paused; do not expand them further for positioning reasons.
2. Finalize the `coding-handoff/v1` JSON contract and fixture examples.
3. Build repository-inspection, schema-validation, Markdown-rendering, and staleness-comparison scripts with tests.
4. Create the Agent Skill around those deterministic scripts.
5. Verify local `/handoff` and `/resume` across two coding-agent clients.
6. Add explicit optional upload/fetch adapters to the existing hosted API without making them the default.
7. Reposition the homepage, README, package descriptions, docs, and discovery metadata.
8. Correct canonical-domain, key-prefix, signup-email, and API-contract drift across all surfaces.
9. Add compatibility, privacy, and production smoke tests.
10. Publish the Skill and demo, then begin the 30-day adoption test.

Keep the canonical production domain as `contextcapsule.ai` everywhere. Remove stale `customcapsule.ai` references unless that domain has a separately documented purpose.

## 18. Product and Implementation References

- [Agent Skills specification](https://agentskills.io/specification)
- [Agent Skills script guidance](https://agentskills.io/skill-creation/using-scripts)
- [OpenAI Agents SDK handoffs](https://openai.github.io/openai-agents-python/handoffs/)
- [OpenAI Agents SDK sessions](https://openai.github.io/openai-agents-python/sessions/)
- [LangGraph persistence](https://docs.langchain.com/oss/javascript/langgraph/persistence)
- [A2A task, context, and artifact specification](https://a2a-protocol.org/latest/specification/)
