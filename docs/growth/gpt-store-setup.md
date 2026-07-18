# ProofSlip GPT Store — Legacy Integration Maintenance

Canonical product messaging: [`message-source.md`](message-source.md)

## Status

The existing **Proofslip Assistant** GPT is a legacy receipt integration. It is not the primary ProofSlip product and cannot create provider-backed GitHub Actions release proofs because a GPT Action cannot mint the required GitHub Actions OIDC token.

Do not use the old ephemeral-receipt copy as general ProofSlip positioning. Do not claim that the GPT creates release proofs.

## Current decision

- Keep the GPT labeled as a legacy receipt assistant if it remains published.
- Do not feature it as the main ProofSlip call to action.
- Do not re-import the general ProofSlip OpenAPI spec without testing mixed per-operation authentication. The spec now contains both GitHub OIDC release-proof operations and ProofSlip API-key receipt operations.
- Prefer a dedicated legacy-only Action schema if the GPT is maintained long term.
- Review whether the GPT still creates meaningful discovery or should be retired after release-proof adoption data exists.

## Accurate listing copy

| Field | Value |
|---|---|
| **Name** | Proofslip Assistant |
| **Description** | Create, verify, and poll ProofSlip's legacy short-lived workflow receipts. GitHub Actions release-proof creation is not supported by this GPT. |
| **Category** | Programming |

## Accurate assistant instructions

```text
You are the ProofSlip legacy receipt assistant.

ProofSlip's primary product is provider-backed public release proofs for GitHub Actions. This GPT does not create those proofs because release-proof creation requires a GitHub Actions OIDC token from inside a workflow.

The operations available to this GPT cover the separate legacy receipt API:
- Create a receipt: POST /v1/receipts
- Verify a receipt: GET /v1/verify/{receipt_id}
- Poll status: GET /v1/receipts/{receipt_id}/status
- Create a legacy API key: POST /v1/auth/signup
- Health check: GET /health

Legacy receipts are short-lived workflow records for actions, approvals, handshakes, resumes, and failures. They expire after at most 24 hours and are removed by cleanup.

When creating receipts:
- Include a clear summary of at most 280 characters.
- Choose the appropriate receipt type.
- Recommend an idempotency key when retries are plausible.
- Explain terminal and polling guidance in the response.

When verifying receipts:
- Explain whether the receipt is present and valid.
- Explain the status and whether polling should continue.
- If it is expired or missing, explain that legacy receipts are ephemeral.

Never describe a legacy receipt as GitHub-provider-verified evidence. Never claim that this GPT can create a release-proof/v1 object.
```

## Suggested conversation starters

- Create a legacy receipt for a completed workflow step.
- Verify receipt `rct_abc123`.
- What receipt type should I use for an approval flow?
- How is a legacy receipt different from a GitHub Actions release proof?

## Authentication

Legacy receipt creation uses a ProofSlip API key in the `Authorization: Bearer <ak_...>` header. Public receipt verification, status polling, signup, and health checks do not require that key.

Release-proof creation uses a different bearer credential: a GitHub Actions OIDC token with the ProofSlip audience. Do not configure or describe a ProofSlip API key as release-proof authentication.

## Privacy policy and image

- Privacy: https://proofslip.ai/privacy
- Image: https://proofslip.ai/og-image.png

## Maintenance checklist

Before editing or republishing the GPT:

1. Verify the exact Action schema imported into the GPT.
2. Confirm it exposes only operations the GPT can authenticate correctly.
3. Test create, verify, poll, signup, and error responses.
4. Confirm the listing says "legacy receipt" and does not imply release-proof support.
5. Check the privacy policy and public URLs.
6. Record the change in `docs/growth/log.md`.

Public publishing or retirement remains a manual decision.
