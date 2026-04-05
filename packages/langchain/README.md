# langchain-proofslip

LangChain tools for [ProofSlip](https://proofslip.ai) — ephemeral receipt-based verification for AI agent workflows.

Agents use ProofSlip receipts to prove what happened before deciding what to do next. Receipts are ephemeral (24h max), verifiable, and include polling guidance for non-terminal states.

## Install

```bash
pip install langchain-proofslip
```

## Quick Start

```python
from langchain_proofslip import ProofSlipToolkit

# Get all tools configured with your API key
toolkit = ProofSlipToolkit(api_key="ak_your_key")
tools = toolkit.get_tools()

# Use with any LangChain agent
from langchain.agents import AgentExecutor, create_tool_calling_agent
agent = create_tool_calling_agent(llm, tools, prompt)
```

Or use individual tools:

```python
from langchain_proofslip import ProofSlipCreateReceipt, ProofSlipVerifyReceipt

create = ProofSlipCreateReceipt(api_key="ak_your_key")
verify = ProofSlipVerifyReceipt()

# Create a receipt
result = create.invoke({
    "type": "action",
    "status": "completed",
    "summary": "Deployed v2.1.0 to production",
})

# Verify it later
receipt = verify.invoke({"receipt_id": "rct_abc123"})
```

## Tools

| Tool | Description | Auth Required |
|------|-------------|---------------|
| `proofslip_create_receipt` | Create a proof receipt (action, approval, handshake, resume, failure) | Yes |
| `proofslip_verify_receipt` | Verify a receipt by ID — full data including status and terminal state | No |
| `proofslip_check_status` | Lightweight polling for non-terminal receipts | No |

## Configuration

Set your API key via constructor or environment variable:

```python
# Via constructor
toolkit = ProofSlipToolkit(api_key="ak_your_key")

# Via environment variable
import os
os.environ["PROOFSLIP_API_KEY"] = "ak_your_key"
toolkit = ProofSlipToolkit()
```

Get a free API key at [proofslip.ai](https://proofslip.ai) (500 receipts/month).

## Why Receipts?

In multi-agent workflows, agents need to verify what already happened before deciding what to do next. Without verification:

- Agent B retries an action Agent A already completed (duplicate side effects)
- Workflows break on restart because there's no proof of prior steps
- Approvals get lost between agent handoffs

ProofSlip receipts solve this with ephemeral, verifiable proof objects that expire automatically.

## Links

- [ProofSlip API Docs](https://proofslip.ai/docs)
- [ProofSlip MCP Server](https://www.npmjs.com/package/@proofslip/mcp-server)
- [GitHub](https://github.com/Johnny-Z13/proofslip)
