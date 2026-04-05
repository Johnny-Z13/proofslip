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
