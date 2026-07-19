# Release proof contract

## Evidence lanes

1. Provider-verified facts come from a GitHub Actions OIDC token whose signature, issuer, audience, lifetime, and required claims ProofSlip validates.
2. ProofSlip observations are bounded HTTP checks performed when the proof is issued. They establish the observed response at that time, not the deployed commit's contents.
3. Submitted context is workflow-supplied metadata. It is useful but not independently verified.

## What GitHub OIDC establishes

- The GitHub repository, ref, commit SHA, workflow reference, run, attempt, actor, event, and subject of the job that requested the token.
- That ProofSlip accepted a token issued for the `https://proofslip.ai` audience and created the immutable proof record.

## What it does not establish by itself

- That every test passed.
- That the full workflow concluded successfully after the proof step.
- That a deployment contains the claimed commit.
- That an HTTP 2xx response means the application is correct.
- That submitted labels or notes are true.

## Safe setup boundary

- Put the proof step inside the real release workflow after the required checks and deployment step.
- Grant only `contents: read` and `id-token: write` unless the existing workflow separately needs more.
- Never store or print the OIDC token.
- Do not send repository secrets, response bodies, cookies, or headers to ProofSlip.
- Use an explicit public HTTPS observation URL without credentials, custom ports, or IP literals.
