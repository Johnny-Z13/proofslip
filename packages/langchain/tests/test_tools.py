"""Tests for LangChain ProofSlip tools."""

import json
import pytest
from unittest.mock import MagicMock, patch

from langchain_proofslip import (
    ProofSlipCreateReceipt,
    ProofSlipVerifyReceipt,
    ProofSlipCheckStatus,
    ProofSlipToolkit,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_client(return_values: dict | None = None):
    """Return a MagicMock client with sensible defaults."""
    client = MagicMock()
    rv = return_values or {}
    client.create_receipt.return_value = rv.get("create_receipt", {"receipt_id": "rct_test"})
    client.verify_receipt.return_value = rv.get("verify_receipt", {"receipt_id": "rct_test", "status": "completed"})
    client.check_status.return_value = rv.get("check_status", {"status": "completed", "is_terminal": True})
    return client


# ---------------------------------------------------------------------------
# ProofSlipCreateReceipt
# ---------------------------------------------------------------------------

class TestProofSlipCreateReceipt:
    def test_tool_name(self):
        tool = ProofSlipCreateReceipt(api_key="ak_test")
        assert tool.name == "proofslip_create_receipt"

    def test_has_description(self):
        tool = ProofSlipCreateReceipt(api_key="ak_test")
        assert len(tool.description) > 10

    def test_calls_client_create_receipt(self):
        mock_client = make_client()
        with patch("langchain_proofslip.tools._get_client", return_value=mock_client):
            tool = ProofSlipCreateReceipt(api_key="ak_test")
            tool._run(type="action", status="completed", summary="Did the thing")
            mock_client.create_receipt.assert_called_once_with(
                type="action",
                status="completed",
                summary="Did the thing",
                payload=None,
                idempotency_key=None,
                expires_in=86400,
            )

    def test_returns_json_string(self):
        receipt_data = {"receipt_id": "rct_abc", "status": "completed"}
        mock_client = make_client({"create_receipt": receipt_data})
        with patch("langchain_proofslip.tools._get_client", return_value=mock_client):
            tool = ProofSlipCreateReceipt(api_key="ak_test")
            result = tool._run(type="action", status="completed", summary="Done")
            parsed = json.loads(result)
            assert parsed == receipt_data

    def test_parses_payload_json_string(self):
        mock_client = make_client()
        with patch("langchain_proofslip.tools._get_client", return_value=mock_client):
            tool = ProofSlipCreateReceipt(api_key="ak_test")
            tool._run(
                type="action",
                status="completed",
                summary="Done",
                payload='{"key": "value"}',
            )
            call_kwargs = mock_client.create_receipt.call_args[1]
            assert call_kwargs["payload"] == {"key": "value"}

    def test_missing_api_key_raises(self):
        with patch("langchain_proofslip.tools._get_client", wraps=None) as mock_get:
            mock_get.side_effect = ValueError("ProofSlip API key required")
            tool = ProofSlipCreateReceipt()
            with pytest.raises(ValueError, match="API key"):
                tool._run(type="action", status="completed", summary="Done")


# ---------------------------------------------------------------------------
# ProofSlipVerifyReceipt
# ---------------------------------------------------------------------------

class TestProofSlipVerifyReceipt:
    def test_tool_name(self):
        tool = ProofSlipVerifyReceipt()
        assert tool.name == "proofslip_verify_receipt"

    def test_has_description(self):
        tool = ProofSlipVerifyReceipt()
        assert len(tool.description) > 10

    def test_calls_client_verify_receipt(self):
        mock_client = make_client()
        with patch("langchain_proofslip.tools._get_client", return_value=mock_client):
            tool = ProofSlipVerifyReceipt()
            tool._run(receipt_id="rct_abc")
            mock_client.verify_receipt.assert_called_once_with("rct_abc")

    def test_returns_json_string(self):
        verify_data = {"receipt_id": "rct_abc", "status": "completed", "is_terminal": True}
        mock_client = make_client({"verify_receipt": verify_data})
        with patch("langchain_proofslip.tools._get_client", return_value=mock_client):
            tool = ProofSlipVerifyReceipt()
            result = tool._run(receipt_id="rct_abc")
            parsed = json.loads(result)
            assert parsed == verify_data


# ---------------------------------------------------------------------------
# ProofSlipCheckStatus
# ---------------------------------------------------------------------------

class TestProofSlipCheckStatus:
    def test_tool_name(self):
        tool = ProofSlipCheckStatus()
        assert tool.name == "proofslip_check_status"

    def test_has_description(self):
        tool = ProofSlipCheckStatus()
        assert len(tool.description) > 10

    def test_calls_client_check_status(self):
        mock_client = make_client()
        with patch("langchain_proofslip.tools._get_client", return_value=mock_client):
            tool = ProofSlipCheckStatus()
            tool._run(receipt_id="rct_abc")
            mock_client.check_status.assert_called_once_with("rct_abc")

    def test_returns_json_string(self):
        status_data = {"status": "pending", "is_terminal": False, "next_poll_after_seconds": 10}
        mock_client = make_client({"check_status": status_data})
        with patch("langchain_proofslip.tools._get_client", return_value=mock_client):
            tool = ProofSlipCheckStatus()
            result = tool._run(receipt_id="rct_abc")
            parsed = json.loads(result)
            assert parsed == status_data


# ---------------------------------------------------------------------------
# ProofSlipToolkit
# ---------------------------------------------------------------------------

class TestProofSlipToolkit:
    def test_get_tools_returns_three_tools(self):
        toolkit = ProofSlipToolkit(api_key="ak_test")
        tools = toolkit.get_tools()
        assert len(tools) == 3

    def test_all_tool_names_unique(self):
        toolkit = ProofSlipToolkit(api_key="ak_test")
        tools = toolkit.get_tools()
        names = [t.name for t in tools]
        assert len(names) == len(set(names))

    def test_includes_create_verify_status(self):
        toolkit = ProofSlipToolkit(api_key="ak_test")
        tools = toolkit.get_tools()
        names = {t.name for t in tools}
        assert "proofslip_create_receipt" in names
        assert "proofslip_verify_receipt" in names
        assert "proofslip_check_status" in names

    def test_propagates_api_key_to_create_tool(self):
        toolkit = ProofSlipToolkit(api_key="ak_mykey")
        tools = toolkit.get_tools()
        create_tool = next(t for t in tools if t.name == "proofslip_create_receipt")
        assert create_tool.api_key == "ak_mykey"

    def test_propagates_base_url(self):
        toolkit = ProofSlipToolkit(api_key="ak_test", base_url="http://localhost:3000")
        tools = toolkit.get_tools()
        for tool in tools:
            assert tool.base_url == "http://localhost:3000"
