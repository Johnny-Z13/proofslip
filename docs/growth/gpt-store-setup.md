# GPT Store Setup — ProofSlip

Step-by-step guide to create the ProofSlip GPT Action.

## Prerequisites

- ChatGPT Plus account
- Privacy policy page live at https://proofslip.ai/privacy (deployed with this commit)
- Your ProofSlip API key (`ak_...`)

## Steps

### 1. Open the GPT Editor

Go to: **https://chatgpt.com/gpts/editor**

### 2. Configure Tab

| Field | Value |
|-------|-------|
| **Name** | ProofSlip |
| **Description** | Create and verify ephemeral proof receipts for AI agent workflows. Agents use receipts to prove what happened before deciding what to do next. |
| **Category** | Programming |

**Instructions** (paste this):

```
You are a ProofSlip assistant that helps developers and agents create, verify, and manage ephemeral proof receipts.

ProofSlip creates verifiable receipts that prove actions happened. Receipts are ephemeral (expire in 24 hours max), typed, and include polling guidance for non-terminal states.

Receipt types:
- action: proves an action was performed (deployment, payment, notification)
- approval: records a human or agent approval decision
- handshake: confirms two agents established a working agreement
- resume: marks a workflow checkpoint for safe restart
- failure: documents what went wrong and why

When creating receipts:
- Always include a clear, descriptive summary (max 280 chars)
- Use appropriate receipt types for the use case
- Suggest using idempotency_key when retries are likely
- Explain is_terminal and next_poll_after_seconds in responses

When verifying receipts:
- Check if the receipt is still valid (not expired)
- Explain the receipt status and what it means
- If expired/not found, explain that receipts are ephemeral by design

Always be concise and developer-friendly.
```

**Conversation starters:**
- Create a receipt for a completed deployment
- Verify receipt rct_abc123
- What receipt type should I use for an approval flow?
- Sign me up for a free API key

### 3. Add the Action

1. Scroll to **Actions** → click **Create new action**
2. Click **Import from URL**
3. Paste: `https://proofslip.ai/.well-known/openapi.json`
4. Wait for it to parse (should show 4 endpoints)

### 4. Configure Authentication

Below the schema editor:

| Field | Value |
|-------|-------|
| **Auth Type** | API Key |
| **API Key** | `ak_your_key_here` |
| **Auth Type** | Custom |
| **Custom Header Name** | Authorization |
| **Prefix** | Bearer |

### 5. Set Privacy Policy

In the Action settings, set privacy policy URL to: `https://proofslip.ai/privacy`

### 6. Add Profile Image

Use the ProofSlip favicon or OG image. The OG image is at `https://proofslip.ai/og-image.png`.

### 7. Publish

1. Click **Save** → test in preview pane
2. Click **Publish** → set to **Public**
3. OpenAI reviews (1-3 days typically)

## After Publishing

- Add the GPT Store link to proofslip.ai landing page
- Add to listing-cheatsheet.md
- Update playbook.md status to DONE
