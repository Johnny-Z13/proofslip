/**
 * OG image as an inline SVG string.
 * Served at /og-image.png (actually SVG content, but the extension
 * helps social crawlers). 1200x630 standard OG dimensions.
 */
export function renderOgImage(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <text x="600" y="240" text-anchor="middle" font-family="monospace" font-size="72" fill="#e0e0e0" letter-spacing="0.15em">PROOFSLIP</text>
  <line x1="400" y1="280" x2="800" y2="280" stroke="#333" stroke-width="1" stroke-dasharray="8,6"/>
  <rect x="440" y="310" width="320" height="40" rx="2" fill="none" stroke="#16a34a" stroke-width="1.5"/>
  <text x="600" y="338" text-anchor="middle" font-family="monospace" font-size="18" fill="#16a34a" letter-spacing="0.1em">VERIFIED RECEIPT</text>
  <text x="600" y="420" text-anchor="middle" font-family="monospace" font-size="20" fill="#666" letter-spacing="0.05em">ephemeral verification for agent workflows</text>
  <line x1="400" y1="460" x2="800" y2="460" stroke="#333" stroke-width="1" stroke-dasharray="8,6"/>
  <text x="600" y="510" text-anchor="middle" font-family="monospace" font-size="16" fill="#444">receipts expire, trust compounds</text>
</svg>`
}
