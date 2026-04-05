"""Shared test fixtures for langchain-proofslip tests."""

import pytest
from unittest.mock import MagicMock


@pytest.fixture
def mock_response():
    """Create a mock requests.Response."""
    def _make(status_code=200, json_data=None):
        resp = MagicMock()
        resp.status_code = status_code
        resp.json.return_value = json_data or {}
        resp.raise_for_status = MagicMock()
        if status_code >= 400:
            from requests.exceptions import HTTPError
            resp.raise_for_status.side_effect = HTTPError(
                f"{status_code} Error", response=resp
            )
        return resp
    return _make
