---
name: proofslip-release-proof
description: Verify a ProofSlip release proof or add provider-backed release proof to a GitHub Actions deployment workflow. Use when a coding agent or CI job claims it shipped, when another agent must decide whether to trust a release claim, or when a repository needs the minimal ProofSlip GitHub OIDC setup. Do not use it to treat submitted notes, test claims, or deployment contents as independently verified.
---

# ProofSlip Release Proof

Separate provider-verified facts, ProofSlip observations, and submitted context. Never collapse them into a generic “verified deployment” claim.

## Choose the workflow

- For a proof ID or URL, verify the existing proof.
- For a request to add release proof, inspect the repository and prepare the GitHub Actions change.
- For a vague shipping claim without a proof, explain that the claim is currently unverified and offer the setup workflow.

## Verify an existing proof

1. Run:

   ```bash
   node <skill-dir>/scripts/verify-proof.mjs <proof-id-or-url>
   ```

   Replace `<skill-dir>` with this skill directory. For an explicitly trusted self-hosted instance, add `--base-url https://host.example`.

2. Stop if the script reports `unverifiable` or `invalid`, or if the repository, commit, ref, workflow, run, or event does not match the release task at hand.
3. Report these evidence lanes separately:
   - **Provider verified:** repository, commit SHA, ref, workflow, run, actor, and event from GitHub Actions OIDC.
   - **ProofSlip observed:** bounded HTTP observations made by ProofSlip, including failures and timestamps.
   - **Submitted, not verified:** labels and context supplied by the workflow.
4. State the limitations from `references/release-proof-contract.md`.
5. Compare the verified repository, SHA, ref, workflow, run, and event with the current task before allowing downstream work to rely on the proof.

## Add release proof to GitHub Actions

1. Inspect the repository root, current branch, working tree, and `.github/workflows/` without changing them.
2. Identify the existing workflow and job that actually performs the release. Do not create a detached “proof” workflow that runs independently of the release it describes.
3. Read `references/release-proof-contract.md` and `assets/proofslip-release-proof-step.yml`.
4. Propose the smallest patch:
   - add `id-token: write` and `contents: read` permissions;
   - add the ProofSlip step only after the release and required checks succeed;
   - keep the OIDC token ephemeral and masked;
   - send no ProofSlip API key;
   - include a deployment observation only for an explicit public HTTPS target;
   - write the returned proof URL to the GitHub Actions job summary.
5. Ask for approval before editing workflow files. Treat workflow permissions as security-sensitive.
6. After approval, adapt the bundled step to the repository rather than copying placeholders unchanged.
7. Validate the YAML and existing repository checks. Do not commit, push, run a release, or change production without separate authorization.

## Output

Conclude with:

- verdict: `verified`, `expired`, `invalid`, or `unverifiable`;
- exact repository and commit covered;
- provider-verified facts;
- ProofSlip observations;
- submitted context;
- what the proof does not establish;
- the next safe action.
