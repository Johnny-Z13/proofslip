"""Tests for ProofSlipClient."""

import pytest
from unittest.mock import patch
from requests.exceptions import HTTPError

from langchain_proofslip.client import ProofSlipClient


class TestProofSlipClientInit:
    def test_default_base_url(self):
        client = ProofSlipClient(api_key="ak_test")
        assert client.base_url == "https://proofslip.ai"

    def test_custom_base_url(self):
        client = ProofSlipClient(api_key="ak_test", base_url="http://localhost:3000/")
        # trailing slash should be stripped
        assert client.base_url == "http://localhost:3000"

    def test_stores_api_key(self):
        client = ProofSlipClient(api_key="ak_mykey")
        assert client.api_key == "ak_mykey"


class TestCreateReceipt:
    def test_sends_auth_header(self, mock_response):
        client = ProofSlipClient(api_key="ak_secret")
        fake_resp = mock_response(200, {"receipt_id": "rct_123"})

        with patch("langchain_proofslip.client.requests.post", return_value=fake_resp) as mock_post:
            client.create_receipt(type="action", status="completed", summary="Done")
            call_kwargs = mock_post.call_args
            headers = call_kwargs.kwargs.get("headers") or call_kwargs[1].get("headers")
            assert headers["Authorization"] == "Bearer ak_secret"

    def test_posts_to_correct_url(self, mock_response):
        client = ProofSlipClient(api_key="ak_test")
        fake_resp = mock_response(200, {"receipt_id": "rct_abc"})

        with patch("langchain_proofslip.client.requests.post", return_value=fake_resp) as mock_post:
            client.create_receipt(type="action", status="completed", summary="Done")
            url = mock_post.call_args[0][0]
            assert url == "https://proofslip.ai/v1/receipts"

    def test_custom_base_url_in_create(self, mock_response):
        client = ProofSlipClient(api_key="ak_test", base_url="http://localhost:3000")
        fake_resp = mock_response(200, {"receipt_id": "rct_abc"})

        with patch("langchain_proofslip.client.requests.post", return_value=fake_resp) as mock_post:
            client.create_receipt(type="action", status="completed", summary="Done")
            url = mock_post.call_args[0][0]
            assert url == "http://localhost:3000/v1/receipts"

    def test_returns_json(self, mock_response):
        client = ProofSlipClient(api_key="ak_test")
        payload = {"receipt_id": "rct_xyz", "status": "completed"}
        fake_resp = mock_response(200, payload)

        with patch("langchain_proofslip.client.requests.post", return_value=fake_resp):
            result = client.create_receipt(type="action", status="completed", summary="Done")
            assert result == payload

    def test_http_error_raises(self, mock_response):
        client = ProofSlipClient(api_key="ak_test")
        fake_resp = mock_response(401, {"error": "unauthorized"})

        with patch("langchain_proofslip.client.requests.post", return_value=fake_resp):
            with pytest.raises(HTTPError):
                client.create_receipt(type="action", status="completed", summary="Done")

    def test_optional_fields_included_when_provided(self, mock_response):
        client = ProofSlipClient(api_key="ak_test")
        fake_resp = mock_response(200, {"receipt_id": "rct_1"})

        with patch("langchain_proofslip.client.requests.post", return_value=fake_resp) as mock_post:
            client.create_receipt(
                type="action",
                status="completed",
                summary="Done",
                payload={"key": "value"},
                idempotency_key="idem_123",
            )
            body = mock_post.call_args.kwargs.get("json") or mock_post.call_args[1].get("json")
            assert body["payload"] == {"key": "value"}
            assert body["idempotency_key"] == "idem_123"

    def test_optional_fields_omitted_when_none(self, mock_response):
        client = ProofSlipClient(api_key="ak_test")
        fake_resp = mock_response(200, {"receipt_id": "rct_1"})

        with patch("langchain_proofslip.client.requests.post", return_value=fake_resp) as mock_post:
            client.create_receipt(type="action", status="completed", summary="Done")
            body = mock_post.call_args.kwargs.get("json") or mock_post.call_args[1].get("json")
            assert "payload" not in body
            assert "idempotency_key" not in body


class TestVerifyReceipt:
    def test_no_auth_header(self, mock_response):
        client = ProofSlipClient(api_key="ak_secret")
        fake_resp = mock_response(200, {"receipt_id": "rct_123"})

        with patch("langchain_proofslip.client.requests.get", return_value=fake_resp) as mock_get:
            client.verify_receipt("rct_123")
            headers = mock_get.call_args.kwargs.get("headers") or mock_get.call_args[1].get("headers")
            assert "Authorization" not in headers

    def test_correct_url(self, mock_response):
        client = ProofSlipClient(api_key="ak_test")
        fake_resp = mock_response(200, {"receipt_id": "rct_abc"})

        with patch("langchain_proofslip.client.requests.get", return_value=fake_resp) as mock_get:
            client.verify_receipt("rct_abc")
            url = mock_get.call_args[0][0]
            assert url == "https://proofslip.ai/v1/verify/rct_abc"

    def test_custom_base_url(self, mock_response):
        client = ProofSlipClient(api_key="ak_test", base_url="http://localhost:3000")
        fake_resp = mock_response(200, {"receipt_id": "rct_abc"})

        with patch("langchain_proofslip.client.requests.get", return_value=fake_resp) as mock_get:
            client.verify_receipt("rct_abc")
            url = mock_get.call_args[0][0]
            assert url == "http://localhost:3000/v1/verify/rct_abc"

    def test_http_error_raises(self, mock_response):
        client = ProofSlipClient(api_key="ak_test")
        fake_resp = mock_response(404, {"error": "not_found"})

        with patch("langchain_proofslip.client.requests.get", return_value=fake_resp):
            with pytest.raises(HTTPError):
                client.verify_receipt("rct_missing")


class TestCheckStatus:
    def test_correct_url(self, mock_response):
        client = ProofSlipClient(api_key="ak_test")
        fake_resp = mock_response(200, {"status": "completed", "is_terminal": True})

        with patch("langchain_proofslip.client.requests.get", return_value=fake_resp) as mock_get:
            client.check_status("rct_abc")
            url = mock_get.call_args[0][0]
            assert url == "https://proofslip.ai/v1/receipts/rct_abc/status"

    def test_returns_json(self, mock_response):
        client = ProofSlipClient(api_key="ak_test")
        payload = {"status": "pending", "is_terminal": False, "next_poll_after_seconds": 5}
        fake_resp = mock_response(200, payload)

        with patch("langchain_proofslip.client.requests.get", return_value=fake_resp):
            result = client.check_status("rct_abc")
            assert result == payload

    def test_http_error_raises(self, mock_response):
        client = ProofSlipClient(api_key="ak_test")
        fake_resp = mock_response(404, {"error": "not_found"})

        with patch("langchain_proofslip.client.requests.get", return_value=fake_resp):
            with pytest.raises(HTTPError):
                client.check_status("rct_missing")
