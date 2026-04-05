import { describe, it, expect } from 'vitest'

const BASE = process.env.PROOFSLIP_BASE_URL || 'https://www.proofslip.ai'

// Sites that block automated requests (403/429 on HEAD and GET)
const SKIP_DOMAINS = ['npmjs.com', 'npm.com']

function extractUrls(html: string): string[] {
  const hrefRegex = /href="(https?:\/\/[^"]+)"/g
  const urls: string[] = []
  let match
  while ((match = hrefRegex.exec(html)) !== null) {
    urls.push(match[1])
  }
  return [...new Set(urls)]
}

function extractTextUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s)>"',]+/g
  const raw = text.match(urlRegex) || []
  // Strip trailing punctuation that's not part of URLs
  return [...new Set(raw.map((u) => u.replace(/[.,;:'"]+$/, '')))]
}

function shouldSkip(url: string): boolean {
  if (SKIP_DOMAINS.some((d) => url.includes(d))) return true
  // Skip example/placeholder URLs from docs (e.g., /verify/rct_ with no full ID)
  if (url.match(/\/verify\/rct_[^a-zA-Z0-9]/)) return true
  if (url.endsWith('/verify/rct_')) return true
  return false
}

async function checkUrl(url: string): Promise<{ url: string; status: number; ok: boolean }> {
  if (shouldSkip(url)) return { url, status: 200, ok: true }
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    return { url, status: res.status, ok: res.status < 400 }
  } catch {
    try {
      const res = await fetch(url, { redirect: 'follow' })
      return { url, status: res.status, ok: res.status < 400 }
    } catch {
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
    const urls = extractTextUrls(text)

    expect(urls.length).toBeGreaterThan(0)

    const results = await Promise.all(urls.map(checkUrl))
    const broken = results.filter((r) => !r.ok)

    if (broken.length > 0) {
      console.log('Broken links:', broken)
    }
    expect(broken).toEqual([])
  })
})
