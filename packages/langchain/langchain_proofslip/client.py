"""Thin HTTP client for the ProofSlip API."""

from __future__ import annotations

from typing import Any

import requests

BASE_URL = "https://proofslip.ai"


class ProofSlipClient:
    """Minimal HTTP client for ProofSlip API."""

    def __init__(self, api_key: str, base_url: str = BASE_URL) -> None:
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")

    def _headers(self, auth: bool = True) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if auth:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def create_receipt(
        self,
        *,
        type: str,
        status: str,
        summary: str,
        payload: dict[str, Any] | None = None,
        ref: dict[str, Any] | None = None,
        expires_in: int = 86400,
        idempotency_key: str | None = None,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {
            "type": type,
            "status": status,
            "summary": summary,
            "expires_in": expires_in,
        }
        if payload is not None:
            body["payload"] = payload
        if ref is not None:
            body["ref"] = ref
        if idempotency_key is not None:
            body["idempotency_key"] = idempotency_key

        resp = requests.post(
            f"{self.base_url}/v1/receipts",
            headers=self._headers(),
            json=body,
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()

    def verify_receipt(self, receipt_id: str) -> dict[str, Any]:
        resp = requests.get(
            f"{self.base_url}/v1/verify/{receipt_id}",
            headers=self._headers(auth=False),
            params={"format": "json"},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()

    def check_status(self, receipt_id: str) -> dict[str, Any]:
        resp = requests.get(
            f"{self.base_url}/v1/receipts/{receipt_id}/status",
            headers=self._headers(auth=False),
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()
