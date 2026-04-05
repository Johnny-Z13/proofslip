# Full Stack Test Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One command (`npm run test:all`) that tests every layer of ProofSlip and prints a pass/fail report.

**Architecture:** Four test layers (smoke, discovery/links, MCP package, LangChain package) all orchestrated by a single script. Smoke tests make real HTTP calls to production. Package tests mock HTTP and test tool logic.

**Tech Stack:** Vitest (TypeScript tests), pytest (Python tests), tsx (orchestrator script)

---

## File Structure

```
scripts/
└── test-all.ts              # Orchestrator — runs vitest + pytest, prints summary

tests/
├── smoke/
│   ├── api-lifecycle.test.ts    # Real API calls: create → verify → poll → idempotency
│   ├── discovery.test.ts        # All discovery endpoints return valid data
│   └── links.test.ts            # All URLs on landing page + llms.txt resolve
├── packages/
│   └── mcp-server/
│       ├── client.test.ts       # ProofSlipClient HTTP logic
│       └── tools.test.ts        # All 4 MCP tool handlers

packages/langchain/
└── tests/
    ├── conftest.py              # Shared fixtures (mock client)
    ├── test_client.py           # ProofSlipClient Python HTTP logic
    └── test_tools.py            # All 3 LangChain tools + toolkit
```

---

### Task 1: Vitest Config + npm Scripts

**Files:**
- Modify: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Update vitest config to support smoke test timeouts**

In `vitest.config.ts`, replace the entire file with:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000,
  },
})
```

- [ ] **Step 2: Add npm scripts**

In `package.json`, replace the `"test"` script line and add new scripts:

```json
"test": "vitest",
"test:unit": "vitest run tests/lib/ tests/routes/",
"test:smoke": "vitest run tests/smoke/",
"test:packages": "vitest run tests/packages/",
"test:all": "tsx scripts/test-all.ts"
```

- [ ] **Step 3: Verify existing tests still pass**

Run: `npx vitest run tests/lib/ tests/routes/`
Expected: All existing tests pass.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts package.json
git commit -m "chore: add test:all scripts and bump vitest timeout for smoke tests"
```

---

### Task 2: Smoke Test — API Lifecycle

**Files:**
- Create: `tests/smoke/api-lifecycle.test.ts`

- [ ] **Step 1: Create the smoke test file**

```typescript
import { describe, it, expect } from 'vitest'

const BASE = process.env.PROOFSLIP_BASE_URL || 'https://proofslip.ai'
const API_KEY = process.env.PROOFSLIP_API_KEY

describe('Smoke: API Lifecycle', () => {
  let receiptId: string
  let verifyUrl: string
  const idempotencyKey = `test_${Date.now()}_${Math.random().toString(36).slice(2)}`

  it('health check returns 200', async () => {
    const res = await fetch(`${BASE}/health`)
    expect(res.status).toBe(200)
  })

  it('creates a receipt', async () => {
    expect(API_KEY).toBeTruthy()
    const res = await fetch(`${BASE}/v1/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        type: 'action',
        status: 'completed',
        summary: `Automated test receipt ${new Date().toISOString()}`,
        idempotency_key: idempotencyKey,
        expires_in: 60,
      }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.receipt_id).toMatch(/^rct_/)
    expect(data.verify_url).toContain('/verify/')
    receiptId = data.receipt_id
    verifyUrl = data.verify_url
  })

  it('verifies the receipt (JSON)', async () => {
    const res = await fetch(`${BASE}/v1/verify/${receiptId}?format=json`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.id).toBe(receiptId)
    expect(data.type).toBe('action')
    expect(data.status).toBe('completed')
    expect(data.summary).toContain('Automated test receipt')
    expect(data.is_terminal).toBe(true)
  })

  it('polls receipt status', async () => {
    const res = await fetch(`${BASE}/v1/receipts/${receiptId}/status`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.id).toBe(receiptId)
    expect(data.status).toBe('completed')
    expect(data.is_terminal).toBe(true)
    expect(data).toHaveProperty('expires_at')
  })

  it('idempotency returns same receipt', async () => {
    const res = await fetch(`${BASE}/v1/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        type: 'action',
        status: 'completed',
        summary: 'Duplicate test receipt',
        idempotency_key: idempotencyKey,
        expires_in: 60,
      }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.receipt_id).toBe(receiptId)
  })

  it('verifies the receipt (HTML)', async () => {
    const res = await fetch(`${BASE}/v1/verify/${receiptId}`, {
      headers: { Accept: 'text/html' },
    })
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(res.headers.get('content-type')).toContain('text/html')
    expect(html).toContain(receiptId)
  })
})
```

- [ ] **Step 2: Run smoke test**

Run: `npx vitest run tests/smoke/api-lifecycle.test.ts`
Expected: All 6 tests pass (requires `PROOFSLIP_API_KEY` in `.env`).

- [ ] **Step 3: Commit**

```bash
git add tests/smoke/api-lifecycle.test.ts
git commit -m "test: add smoke tests for API lifecycle against production"
```

---

### Task 3: Smoke Test — Discovery Endpoints

**Files:**
- Create: `tests/smoke/discovery.test.ts`

- [ ] **Step 1: Create the discovery test file**

```typescript
import { describe, it, expect } from 'vitest'

const BASE = process.env.PROOFSLIP_BASE_URL || 'https://proofslip.ai'

describe('Smoke: Discovery Endpoints', () => {
  it('GET /llms.txt returns valid content', async () => {
    const res = await fetch(`${BASE}/llms.txt`)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('ProofSlip')
  })

  it('GET /llms-full.txt returns full API reference', async () => {
    const res = await fetch(`${BASE}/llms-full.txt`)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('POST /v1/receipts')
  })

  it('GET /.well-known/openapi.json returns valid OpenAPI spec', async () => {
    const res = await fetch(`${BASE}/.well-known/openapi.json`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('openapi')
    expect(data).toHaveProperty('paths')
    expect(data).toHaveProperty('info')
  })

  it('GET /.well-known/mcp.json returns MCP manifest', async () => {
    const res = await fetch(`${BASE}/.well-known/mcp.json`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('tools')
  })

  it('GET /.well-known/ai-plugin.json returns ChatGPT plugin manifest', async () => {
    const res = await fetch(`${BASE}/.well-known/ai-plugin.json`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('name_for_model')
    expect(data.name_for_model).toBe('proofslip')
  })

  it('GET /.well-known/agent.json returns agent manifest', async () => {
    const res = await fetch(`${BASE}/.well-known/agent.json`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(typeof data).toBe('object')
  })

  it('GET /docs returns documentation page', async () => {
    const res = await fetch(`${BASE}/docs`)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('API')
  })

  it('GET /privacy returns privacy page', async () => {
    const res = await fetch(`${BASE}/privacy`)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Privacy')
  })

  it('GET /example returns example receipt', async () => {
    const res = await fetch(`${BASE}/example`)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html.toLowerCase()).toContain('receipt')
  })
})
```

- [ ] **Step 2: Run discovery tests**

Run: `npx vitest run tests/smoke/discovery.test.ts`
Expected: All 9 tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/smoke/discovery.test.ts
git commit -m "test: add smoke tests for all discovery endpoints"
```

---

### Task 4: Smoke Test — Link Checker

**Files:**
- Create: `tests/smoke/links.test.ts`

- [ ] **Step 1: Create the link checker test file**

```typescript
import { describe, it, expect } from 'vitest'

const BASE = process.env.PROOFSLIP_BASE_URL || 'https://proofslip.ai'

function extractUrls(html: string): string[] {
  const hrefRegex = /href="(https?:\/\/[^"]+)"/g
  const urls: string[] = []
  let match
  while ((match = hrefRegex.exec(html)) !== null) {
    urls.push(match[1])
  }
  return [...new Set(urls)]
}

async function checkUrl(url: string): Promise<{ url: string; status: number; ok: boolean }> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    return { url, status: res.status, ok: res.status < 400 }
  } catch {
    // HEAD may be blocked, try GET
    try {
      const res = await fetch(url, { redirect: 'follow' })
      return { url, status: res.status, ok: res.status < 400 }
    } catch (err) {
      return { url, status: 0, ok: false }
    }
  }
}

describe('Smoke: Link Checker', () => {
  it('all links on landing page resolve', async () => {
    const res = await fetch(BASE)
    const html = await res.text()
    const urls = extractUrls(html)

    expect(urls.length).toBeGreaterThan(0)

    const results = await Promise.all(urls.map(checkUrl))
    const broken = results.filter((r) => !r.ok)

    if (broken.length > 0) {
      console.log('Broken links:', broken)
    }
    expect(broken).toEqual([])
  })

  it('all links in llms.txt resolve', async () => {
    const res = await fetch(`${BASE}/llms.txt`)
    const text = await res.text()
    const urlRegex = /https?:\/\/[^\s)>]+/g
    const urls = [...new Set(text.match(urlRegex) || [])]

    expect(urls.length).toBeGreaterThan(0)

    const results = await Promise.all(urls.map(checkUrl))
    const broken = results.filter((r) => !r.ok)

    if (broken.length > 0) {
      console.log('Broken links:', broken)
    }
    expect(broken).toEqual([])
  })
})
```

- [ ] **Step 2: Run link checker**

Run: `npx vitest run tests/smoke/links.test.ts`
Expected: All links resolve (2 tests pass).

- [ ] **Step 3: Commit**

```bash
git add tests/smoke/links.test.ts
git commit -m "test: add link checker for landing page and llms.txt"
```

---

### Task 5: MCP Server Package Tests

**Files:**
- Create: `tests/packages/mcp-server/client.test.ts`
- Create: `tests/packages/mcp-server/tools.test.ts`

- [ ] **Step 1: Create client test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProofSlipClient } from '../../../packages/mcp-server/src/client.js'

describe('MCP: ProofSlipClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sends Authorization header on create', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ receipt_id: 'rct_test' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient('https://proofslip.ai', 'ak_testkey')
    await client.createReceipt({
      type: 'action',
      status: 'completed',
      summary: 'Test',
    })

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toBe('https://proofslip.ai/v1/receipts')
    expect(opts.headers.Authorization).toBe('Bearer ak_testkey')
    expect(opts.method).toBe('POST')
  })

  it('does not send auth header on verify', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'rct_test' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient('https://proofslip.ai', 'ak_testkey')
    await client.verifyReceipt('rct_test')

    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toBe('https://proofslip.ai/v1/verify/rct_test?format=json')
    expect(opts.headers).not.toHaveProperty('Authorization')
  })

  it('does not send auth header on checkStatus', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'rct_test', status: 'completed' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient('https://proofslip.ai')
    await client.checkStatus('rct_test')

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('https://proofslip.ai/v1/receipts/rct_test/status')
  })

  it('returns ok:false on HTTP error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'unauthorized', message: 'Bad key' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient('https://proofslip.ai', 'ak_bad')
    const result = await client.createReceipt({
      type: 'action',
      status: 'done',
      summary: 'Test',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(401)
      expect(result.error).toBe('unauthorized')
    }
  })

  it('returns ok:false on network error', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient('https://proofslip.ai', 'ak_test')
    const result = await client.createReceipt({
      type: 'action',
      status: 'done',
      summary: 'Test',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('network_error')
    }
  })

  it('hasApiKey returns true when key set', () => {
    const client = new ProofSlipClient('https://proofslip.ai', 'ak_test')
    expect(client.hasApiKey()).toBe(true)
  })

  it('hasApiKey returns false when no key', () => {
    const client = new ProofSlipClient('https://proofslip.ai')
    expect(client.hasApiKey()).toBe(false)
  })

  it('encodes receipt ID in URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient('https://proofslip.ai')
    await client.verifyReceipt('rct_with spaces&chars')

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('rct_with%20spaces%26chars')
  })
})
```

- [ ] **Step 2: Create tools test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProofSlipClient } from '../../../packages/mcp-server/src/client.js'

describe('MCP: Tool Handlers', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('create_receipt returns error when no API key', async () => {
    const client = new ProofSlipClient('https://proofslip.ai')
    expect(client.hasApiKey()).toBe(false)
  })

  it('create_receipt sends correct body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          receipt_id: 'rct_abc',
          verify_url: 'https://proofslip.ai/verify/rct_abc',
          is_terminal: true,
          next_poll_after_seconds: null,
        }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient('https://proofslip.ai', 'ak_test')
    const result = await client.createReceipt({
      type: 'action',
      status: 'completed',
      summary: 'Deployed v2',
      payload: { version: '2.0' },
      idempotency_key: 'deploy_v2',
      expires_in: 3600,
    })

    expect(result.ok).toBe(true)
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.type).toBe('action')
    expect(body.status).toBe('completed')
    expect(body.summary).toBe('Deployed v2')
    expect(body.payload).toEqual({ version: '2.0' })
    expect(body.idempotency_key).toBe('deploy_v2')
    expect(body.expires_in).toBe(3600)
  })

  it('verify_receipt returns full receipt data', async () => {
    const receiptData = {
      id: 'rct_abc',
      type: 'action',
      status: 'completed',
      summary: 'Test',
      is_terminal: true,
    }
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(receiptData),
    })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient('https://proofslip.ai')
    const result = await client.verifyReceipt('rct_abc')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual(receiptData)
    }
  })

  it('check_status returns minimal fields', async () => {
    const statusData = {
      id: 'rct_abc',
      status: 'completed',
      is_terminal: true,
      next_poll_after_seconds: null,
      expires_at: '2026-04-06T00:00:00Z',
    }
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(statusData),
    })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient('https://proofslip.ai')
    const result = await client.checkStatus('rct_abc')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual(statusData)
    }
  })

  it('signup sends email correctly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ api_key: 'ak_new123' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ProofSlipClient('https://proofslip.ai')
    const result = await client.signup('test@example.com')

    expect(result.ok).toBe(true)
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.email).toBe('test@example.com')
    expect(body.source).toBe('api')
    // signup does not send auth header
    expect(mockFetch.mock.calls[0][1].headers).not.toHaveProperty('Authorization')
  })
})
```

- [ ] **Step 3: Run MCP package tests**

Run: `npx vitest run tests/packages/mcp-server/`
Expected: All tests pass (client: 8 tests, tools: 5 tests).

- [ ] **Step 4: Commit**

```bash
git add tests/packages/mcp-server/
git commit -m "test: add MCP server package tests (client + tools)"
```

---

### Task 6: LangChain Package Tests

**Files:**
- Create: `packages/langchain/tests/conftest.py`
- Create: `packages/langchain/tests/test_client.py`
- Create: `packages/langchain/tests/test_tools.py`
- Modify: `packages/langchain/pyproject.toml` (add test deps)

- [ ] **Step 1: Add test dependencies to pyproject.toml**

Add to `packages/langchain/pyproject.toml` after the `[project.urls]` section:

```toml
[project.optional-dependencies]
test = [
    "pytest>=7.0",
    "langchain-core>=0.2.0",
]
```

- [ ] **Step 2: Create conftest.py with shared fixtures**

```python
"""Shared test fixtures for langchain-proofslip tests."""

import pytest
from unittest.mock import MagicMock, patch


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
```

- [ ] **Step 3: Create client tests**

```python
"""Tests for ProofSlipClient HTTP logic."""

from unittest.mock import patch, MagicMock
from langchain_proofslip.client import ProofSlipClient


class TestProofSlipClient:
    def test_create_receipt_sends_auth_header(self, mock_response):
        client = ProofSlipClient(api_key="ak_test123")
        with patch("langchain_proofslip.client.requests.post") as mock_post:
            mock_post.return_value = mock_response(
                200, {"receipt_id": "rct_abc", "verify_url": "https://proofslip.ai/verify/rct_abc"}
            )
            client.create_receipt(type="action", status="completed", summary="Test")
            mock_post.assert_called_once()
            call_kwargs = mock_post.call_args
            assert call_kwargs[1]["headers"]["Authorization"] == "Bearer ak_test123"

    def test_create_receipt_sends_correct_body(self, mock_response):
        client = ProofSlipClient(api_key="ak_test")
        with patch("langchain_proofslip.client.requests.post") as mock_post:
            mock_post.return_value = mock_response(200, {"receipt_id": "rct_abc"})
            client.create_receipt(
                type="action",
                status="completed",
                summary="Deployed v2",
                payload={"version": "2.0"},
                idempotency_key="deploy_v2",
                expires_in=3600,
            )
            body = mock_post.call_args[1]["json"]
            assert body["type"] == "action"
            assert body["status"] == "completed"
            assert body["summary"] == "Deployed v2"
            assert body["payload"] == {"version": "2.0"}
            assert body["idempotency_key"] == "deploy_v2"
            assert body["expires_in"] == 3600

    def test_verify_receipt_no_auth(self, mock_response):
        client = ProofSlipClient(api_key="ak_test")
        with patch("langchain_proofslip.client.requests.get") as mock_get:
            mock_get.return_value = mock_response(200, {"id": "rct_abc", "status": "completed"})
            client.verify_receipt("rct_abc")
            call_kwargs = mock_get.call_args
            assert "Authorization" not in call_kwargs[1]["headers"]

    def test_check_status_url(self, mock_response):
        client = ProofSlipClient(api_key="ak_test")
        with patch("langchain_proofslip.client.requests.get") as mock_get:
            mock_get.return_value = mock_response(200, {"id": "rct_abc"})
            client.check_status("rct_abc")
            url = mock_get.call_args[0][0]
            assert "/v1/receipts/rct_abc/status" in url

    def test_custom_base_url(self, mock_response):
        client = ProofSlipClient(api_key="ak_test", base_url="https://custom.api")
        with patch("langchain_proofslip.client.requests.post") as mock_post:
            mock_post.return_value = mock_response(200, {"receipt_id": "rct_abc"})
            client.create_receipt(type="action", status="done", summary="Test")
            url = mock_post.call_args[0][0]
            assert url.startswith("https://custom.api")

    def test_http_error_raises(self, mock_response):
        client = ProofSlipClient(api_key="ak_test")
        with patch("langchain_proofslip.client.requests.post") as mock_post:
            mock_post.return_value = mock_response(401, {"error": "unauthorized"})
            import pytest
            with pytest.raises(Exception):
                client.create_receipt(type="action", status="done", summary="Test")
```

- [ ] **Step 4: Create tools tests**

```python
"""Tests for LangChain tool wrappers and toolkit."""

import json
import os
from unittest.mock import patch, MagicMock

import pytest
from langchain_proofslip import (
    ProofSlipCreateReceipt,
    ProofSlipVerifyReceipt,
    ProofSlipCheckStatus,
    ProofSlipToolkit,
)


class TestProofSlipCreateReceipt:
    def test_has_correct_name(self):
        tool = ProofSlipCreateReceipt(api_key="ak_test")
        assert tool.name == "proofslip_create_receipt"

    def test_has_nonempty_description(self):
        tool = ProofSlipCreateReceipt(api_key="ak_test")
        assert len(tool.description) > 10

    def test_raises_without_api_key(self):
        with patch.dict(os.environ, {}, clear=True):
            tool = ProofSlipCreateReceipt()
            with pytest.raises(ValueError, match="API key"):
                tool._run(type="action", status="done", summary="Test")

    def test_calls_client_correctly(self):
        with patch("langchain_proofslip.tools._get_client") as mock_gc:
            mock_client = MagicMock()
            mock_client.create_receipt.return_value = {"receipt_id": "rct_abc"}
            mock_gc.return_value = mock_client

            tool = ProofSlipCreateReceipt(api_key="ak_test")
            result = tool._run(type="action", status="completed", summary="Deploy done")

            mock_client.create_receipt.assert_called_once()
            parsed = json.loads(result)
            assert parsed["receipt_id"] == "rct_abc"


class TestProofSlipVerifyReceipt:
    def test_has_correct_name(self):
        tool = ProofSlipVerifyReceipt()
        assert tool.name == "proofslip_verify_receipt"

    def test_calls_client_correctly(self):
        with patch("langchain_proofslip.tools._get_client") as mock_gc:
            mock_client = MagicMock()
            mock_client.verify_receipt.return_value = {"id": "rct_abc", "status": "completed"}
            mock_gc.return_value = mock_client

            tool = ProofSlipVerifyReceipt()
            result = tool._run(receipt_id="rct_abc")

            mock_client.verify_receipt.assert_called_once_with("rct_abc")
            parsed = json.loads(result)
            assert parsed["id"] == "rct_abc"


class TestProofSlipCheckStatus:
    def test_has_correct_name(self):
        tool = ProofSlipCheckStatus()
        assert tool.name == "proofslip_check_status"

    def test_calls_client_correctly(self):
        with patch("langchain_proofslip.tools._get_client") as mock_gc:
            mock_client = MagicMock()
            mock_client.check_status.return_value = {"id": "rct_abc", "is_terminal": True}
            mock_gc.return_value = mock_client

            tool = ProofSlipCheckStatus()
            result = tool._run(receipt_id="rct_abc")

            mock_client.check_status.assert_called_once_with("rct_abc")
            parsed = json.loads(result)
            assert parsed["is_terminal"] is True


class TestProofSlipToolkit:
    def test_returns_three_tools(self):
        toolkit = ProofSlipToolkit(api_key="ak_test")
        tools = toolkit.get_tools()
        assert len(tools) == 3

    def test_tools_have_unique_names(self):
        toolkit = ProofSlipToolkit(api_key="ak_test")
        tools = toolkit.get_tools()
        names = [t.name for t in tools]
        assert len(names) == len(set(names))

    def test_passes_api_key_to_create_tool(self):
        toolkit = ProofSlipToolkit(api_key="ak_custom")
        tools = toolkit.get_tools()
        create_tool = [t for t in tools if t.name == "proofslip_create_receipt"][0]
        assert create_tool.api_key == "ak_custom"
```

- [ ] **Step 5: Install test deps and run Python tests**

Run:
```bash
cd packages/langchain
pip install -e ".[test]"
pytest tests/ -v
```
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/langchain/
git commit -m "test: add LangChain package tests (client + tools + toolkit)"
```

---

### Task 7: Orchestrator Script

**Files:**
- Create: `scripts/test-all.ts`

- [ ] **Step 1: Create the orchestrator**

```typescript
import { execSync } from 'child_process'

const DIVIDER = '═'.repeat(50)
const results: { name: string; passed: boolean; detail: string }[] = []

function run(name: string, command: string): boolean {
  console.log(`\n▶ ${name}\n`)
  try {
    execSync(command, { stdio: 'inherit', timeout: 300000 })
    results.push({ name, passed: true, detail: 'passed' })
    return true
  } catch {
    results.push({ name, passed: false, detail: 'FAILED' })
    return false
  }
}

console.log(`\n${DIVIDER}`)
console.log('  ProofSlip Full Stack Test Report')
console.log(DIVIDER)

// Layer 1: Existing unit + integration tests
run('[1/4] Unit & Integration Tests', 'npx vitest run tests/lib/ tests/routes/')

// Layer 2: Smoke tests against production
run('[2/4] Smoke Tests (proofslip.ai)', 'npx vitest run tests/smoke/')

// Layer 3: MCP Server package tests
run('[3/4] MCP Server Package', 'npx vitest run tests/packages/')

// Layer 4: LangChain package tests
run('[4/4] LangChain Package', 'cd packages/langchain && python -m pytest tests/ -v')

// Summary
console.log(`\n${DIVIDER}`)
console.log('  Summary')
console.log(DIVIDER)
for (const r of results) {
  const icon = r.passed ? '✓' : '✗'
  console.log(`  ${icon} ${r.name}`)
}
console.log(DIVIDER)

const allPassed = results.every((r) => r.passed)
if (allPassed) {
  console.log('  ALL PASSED ✓')
} else {
  console.log('  SOME TESTS FAILED ✗')
}
console.log(`${DIVIDER}\n`)

process.exit(allPassed ? 0 : 1)
```

- [ ] **Step 2: Run the full suite**

Run: `npm run test:all`
Expected: All 4 layers pass, summary prints at the end.

- [ ] **Step 3: Commit**

```bash
git add scripts/test-all.ts
git commit -m "feat: add test:all orchestrator — one command for full stack testing"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Run `npm run test:all` from project root**

Run: `npm run test:all`
Expected: Clean run, all layers pass, summary shows ALL PASSED.

- [ ] **Step 2: Push**

```bash
git push
```
