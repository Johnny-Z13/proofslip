"""LangChain tools for ProofSlip receipt operations."""

from __future__ import annotations

import json
import os
from typing import Any, Optional, Type

from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field

from langchain_proofslip.client import ProofSlipClient


def _get_client(api_key: str | None = None, base_url: str | None = None) -> ProofSlipClient:
    key = api_key or os.environ.get("PROOFSLIP_API_KEY", "")
    url = base_url or os.environ.get("PROOFSLIP_BASE_URL", "https://proofslip.ai")
    if not key:
        raise ValueError(
            "ProofSlip API key required. Pass api_key or set PROOFSLIP_API_KEY env var. "
            "Get a free key at https://proofslip.ai"
        )
    return ProofSlipClient(api_key=key, base_url=url)


# --- Create Receipt ---

class CreateReceiptInput(BaseModel):
    """Input for creating a ProofSlip receipt."""

    type: str = Field(
        description="Receipt type: 'action', 'approval', 'handshake', 'resume', or 'failure'"
    )
    status: str = Field(
        description="Current status of the receipt (e.g., 'completed', 'pending', 'failed')"
    )
    summary: str = Field(
        description="Human-readable summary of what happened (max 280 chars)"
    )
    payload: Optional[str] = Field(
        default=None,
        description="Optional JSON string with additional structured data (max 4KB)",
    )
    idempotency_key: Optional[str] = Field(
        default=None,
        description="Optional key to prevent duplicate receipt creation on retries",
    )
    expires_in: int = Field(
        default=86400,
        description="Seconds until receipt expires (60-86400, default 24h)",
    )


class ProofSlipCreateReceipt(BaseTool):
    """Create a verifiable proof receipt that proves an action happened.

    Use this when an agent completes an action and needs to create verifiable
    proof — a receipt that other agents can check before proceeding. Receipts
    are ephemeral (max 24h) and include a verify URL.
    """

    name: str = "proofslip_create_receipt"
    description: str = (
        "Create an ephemeral proof receipt that verifies an action happened. "
        "Returns a receipt_id and verify_url that other agents can check. "
        "Use for: completed actions, approvals, agent handshakes, checkpoints, or failures."
    )
    args_schema: Type[BaseModel] = CreateReceiptInput
    api_key: Optional[str] = None
    base_url: Optional[str] = None

    def _run(
        self,
        type: str,
        status: str,
        summary: str,
        payload: str | None = None,
        idempotency_key: str | None = None,
        expires_in: int = 86400,
    ) -> str:
        client = _get_client(self.api_key, self.base_url)
        parsed_payload = json.loads(payload) if payload else None
        result = client.create_receipt(
            type=type,
            status=status,
            summary=summary,
            payload=parsed_payload,
            idempotency_key=idempotency_key,
            expires_in=expires_in,
        )
        return json.dumps(result, indent=2)


# --- Verify Receipt ---

class VerifyReceiptInput(BaseModel):
    """Input for verifying a ProofSlip receipt."""

    receipt_id: str = Field(description="The receipt ID to verify (e.g., 'rct_abc123')")


class ProofSlipVerifyReceipt(BaseTool):
    """Verify a proof receipt to confirm what happened.

    Use this when an agent needs to check whether an action was actually
    completed before proceeding. Returns full receipt data including type,
    status, summary, and whether the state is terminal.
    """

    name: str = "proofslip_verify_receipt"
    description: str = (
        "Verify a proof receipt by ID. Returns the full receipt data including "
        "type, status, summary, and whether the receipt is terminal. "
        "Use before taking actions that depend on prior steps completing."
    )
    args_schema: Type[BaseModel] = VerifyReceiptInput
    base_url: Optional[str] = None

    def _run(self, receipt_id: str) -> str:
        client = _get_client(api_key="unused", base_url=self.base_url)
        # Verify is a public endpoint, no auth needed
        result = client.verify_receipt(receipt_id)
        return json.dumps(result, indent=2)


# --- Check Status ---

class CheckStatusInput(BaseModel):
    """Input for checking receipt status."""

    receipt_id: str = Field(description="The receipt ID to check (e.g., 'rct_abc123')")


class ProofSlipCheckStatus(BaseTool):
    """Lightweight status check for polling non-terminal receipts.

    Use this for polling — when a receipt isn't terminal yet and you need
    to check back. Returns minimal data: status, is_terminal, and
    next_poll_after_seconds.
    """

    name: str = "proofslip_check_status"
    description: str = (
        "Check the current status of a receipt (lightweight polling). "
        "Returns status, is_terminal, and next_poll_after_seconds. "
        "Use when waiting for a non-terminal receipt to reach final state."
    )
    args_schema: Type[BaseModel] = CheckStatusInput
    base_url: Optional[str] = None

    def _run(self, receipt_id: str) -> str:
        client = _get_client(api_key="unused", base_url=self.base_url)
        result = client.check_status(receipt_id)
        return json.dumps(result, indent=2)


# --- Toolkit ---

class ProofSlipToolkit:
    """Convenience class that returns all ProofSlip tools configured with the same credentials."""

    def __init__(self, api_key: str | None = None, base_url: str | None = None) -> None:
        self.api_key = api_key
        self.base_url = base_url

    def get_tools(self) -> list[BaseTool]:
        return [
            ProofSlipCreateReceipt(api_key=self.api_key, base_url=self.base_url),
            ProofSlipVerifyReceipt(base_url=self.base_url),
            ProofSlipCheckStatus(base_url=self.base_url),
        ]
