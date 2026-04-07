# API Economy Business Ideas: Deep Research & Demand Validation

> **Date:** 2026-04-06
> **Scope:** Solo-developer API businesses — no big teams, no VC required
> **Method:** Same demand-proof process used in ProofSlip product review: find real people asking in their own words, map what they end up using, identify the specific gap, kill ideas that fail validation

---

## Table of Contents

1. [The Boring API Pattern](#the-boring-api-pattern)
2. [Solo-Dev API Economics](#solo-dev-api-economics)
3. [Ideas Evaluated (24 total)](#ideas-evaluated)
4. [Ideas Killed (with reasons)](#ideas-killed)
5. [Ideas That Survived Validation (7)](#ideas-that-survived-validation)
6. [Deep Dives: Top 4 Recommended](#deep-dives-top-4-recommended)
7. [Comparison Matrix](#comparison-matrix)
8. [Pre-Build Validation Checklist](#pre-build-validation-checklist)
9. [Sources & References](#sources--references)

---

## The Boring API Pattern

Every successful solo-dev API business follows the same formula. This was reverse-engineered from real revenue data across 15+ businesses:

### The 7-Characteristic Test

A "DevOps Pain Wrapper" API works when it has ALL seven:

| # | Characteristic | Why It Matters |
|---|---------------|----------------|
| 1 | **Wraps something technically annoying** | Not hard to start, hard to maintain in production |
| 2 | **Open-source core exists** | Proves demand; customers know they COULD DIY |
| 3 | **Simple input/output** | URL in → image out. Markdown in → PDF out. |
| 4 | **Production reliability is the real product** | Uptime, edge cases, scaling — that's what you sell |
| 5 | **Usage-based pricing is natural** | Self-selecting tiers, revenue grows with customer growth |
| 6 | **High switching costs once integrated** | $2K-$30K to integrate an API; nobody rewrites for 10% savings |
| 7 | **Near-zero marginal cost** | Serverless/cheap VPS, no human in the loop |

### Proven Examples

| API Business | Wraps | Solo/Small? | Revenue | Running Since |
|-------------|-------|-------------|---------|---------------|
| ApiFlash | Puppeteer | 1 person | $79.7K/yr | 2018 |
| ScreenshotOne | Puppeteer | 1 person | ~$25K+ MRR | 2022 |
| ScreenshotAPI | Puppeteer | 1 person (acquired) | $5.3K/mo | ~2020 |
| Restpack | Chrome + PDF | 1 person | $500K exit | ~2017 |
| Geocodio | Census data | 5 people | $550K/yr | 2014 |
| IPinfo.io | IP databases | Bootstrapped | $3.7M/yr | Side project |
| Healthchecks.io | Cron monitoring | 1 person | Profitable | ~2016 |
| DocRaptor | PrinceXML | Small team | Profitable | 2010 |
| Rendi | FFmpeg | Bootstrapped | Growing | ~2023 |
| ScrapingBee | Chrome + proxies | 4 people → exit | $5M ARR → 8-fig exit | ~2019 |

**Key stat:** 44% of profitable SaaS products are now run by a single founder (Stripe 2024 data, doubled from 2018). Median profitable micro-SaaS: $4.2K MRR.

### The Economics

At $5K MRR with 1M requests/month:
- Infrastructure: ~$50/month (1% of revenue) for lightweight APIs
- Infrastructure: ~$200-500/month for compute-heavy APIs (screenshots, video)
- Gross margin: 90-97%
- Exit multiple: 36-60x MRR ($180K-$300K for $5K MRR business)

SaaS acquisitions on Flippa were up 73.5% in 2025. Acquire.com has facilitated 2,000+ deals totaling ~$500M.

---

## Solo-Dev API Economics

### What Works

- **Price range:** $15-100/month per customer (too cheap = tire-kickers, too expensive = enterprise sales cycle)
- **Free tier:** Essential for adoption, but ceiling must create upgrade pressure
- **Usage-based component:** Natural upsell as customers grow
- **No free tier = 3x fewer signups** (documented across multiple API businesses)

### What Kills Solo API Businesses

1. **Commodity trap:** If 5+ competitors offer the same thing, you compete on price (losing game)
2. **Data maintenance burden:** APIs that require constantly updating datasets (tax rates, IP databases) are not "set and forget"
3. **Compute-heavy workloads:** GPUs, headless Chrome at scale, video encoding — margins shrink fast
4. **Enterprise sales dependency:** If your only customers are enterprises, you need a sales team
5. **Regulatory liability:** Tax, financial, healthcare APIs carry compliance risk a solo dev can't absorb
6. **"Free is good enough":** If an open-source self-hosted option is easy to deploy, your wrapper has no value

---

## Ideas Evaluated

24 ideas across 7 categories, pressure-tested against real demand signals.

### Category Summary

| Category | Ideas Tested | Survived | Best Pick |
|----------|-------------|----------|-----------|
| Data Transformation | 5 | 2 | Pandoc as a Service |
| Verification/Validation | 4 | 0 | All killed |
| Content & Media | 4 | 2 | OG Image API, Diagram Rendering |
| Communication | 3 | 1 | Webhook Relay |
| Business/Commerce | 3 | 0 | All killed |
| Developer Utilities | 3 | 1 | MCP Compatibility Checker |
| Scraping/Data | 2 | 0 | All killed |

---

## Ideas Killed

### Tax Rate Lookup API — KILLED

**Why it looked promising:** Stripe Tax charges 0.5% per transaction. A flat-fee lookup API sounds cheaper.

**Why it's dead:**
- **Ziptax already is the cheap tax rate API** — $0.001/call, developer-friendly, established
- US tax data requires address-level accuracy (ZIP codes span multiple jurisdictions) — you need licensed data, not free CSV dumps
- **681 rate changes per year across 12,000+ jurisdictions** — constant data maintenance, not "set and forget"
- Regulatory liability: wrong tax rate = customer gets audited. Trust bar is impossible for a solo dev's brand-new product
- Market bifurcates: tiny businesses use free calculators, growing businesses need full compliance (filing, nexus), which is a multi-year product

**Revenue ceiling:** $1-3K MRR even if successful. Not worth the liability.

### Lightweight Feature Flags API — KILLED

**Why it looked promising:** LaunchDarkly is comically expensive ($10K+/yr). Surely there's room at the bottom.

**Why it's dead:**
- **Statsig gives away unlimited feature flags forever. Free. At any scale.** This is a deliberate loss-leader to sell analytics. You cannot undercut free.
- PostHog: 1M free flag requests/month
- Unleash, Flipt: free self-hosted, mature projects
- Vercel Edge Config: free with Vercel Pro
- "HTTP-only, no SDK" is a drawback, not a feature — flag evaluation with network latency on every request is a non-starter for high-traffic apps
- **The market is saturated at every price point.** Free, $18/mo, $45/mo, $80/mo, enterprise — every slot is taken.

**Revenue ceiling:** $0. Statsig made this category free.

### Email Verification API — KILLED

**Why:** Commodity market. ZeroBounce ($40M+/yr) dominates. Reacher is open-source (Rust). You'd compete on price against established accuracy track records. The trust bar is high — one false positive ("email is valid" when it bounces) loses a customer.

### Phone Number Validation — KILLED

**Why:** Requires telecom data feed partnerships. Twilio Lookup is $0.005/call. libphonenumber (Google, free) handles format validation. Can't do carrier lookup without data feeds.

### Address Validation — KILLED (with caveat)

**Why:** SmartyStreets ($50M+ revenue) dominates US. USPS API wrapper idea is interesting but US-only and easily replicable. The data maintenance (address changes) is ongoing.

**Caveat:** A modern REST wrapper around the USPS API with caching has some legs, but the moat is paper-thin.

### SSL Certificate Monitoring — KILLED

**Why:** Feature, not a product. Every uptime monitor (UptimeRobot, Better Stack, Oh Dear) includes SSL checks for free.

### Text-to-Speech API — KILLED

**Why:** ElevenLabs dominates quality. Google/Amazon/Azure dominate commodity. Red ocean with well-funded players.

### Cron Job Monitoring — KILLED (niche taken)

**Why:** Healthchecks.io is THE solo-dev success story in this exact niche. Profitable, beloved, running for years. You'd need clear differentiation, and the market is small.

### Error Tracking — KILLED

**Why:** Sentry's free tier is extremely generous. Honeybadger is developer-loved. Highlight.dev is open source. You'd be fighting for scraps below Sentry's free tier.

### Invoice Generation API — KILLED

**Why:** Stripe Invoicing exists. Invoice Ninja is open source. The market wants full accounting integration, not standalone PDF generation. Too low switching costs for a utility.

### Currency Conversion — KILLED

**Why:** Commodity. 5+ cheap providers (Fixer.io, ExchangeRate-API, Open Exchange Rates). ECB data is free. Zero differentiation possible.

### Web Scraping API — KILLED

**Why:** Capital-intensive. Proxy networks are expensive. Anti-bot detection is an arms race. ScrapingBee needed 4 people and years to reach $5M ARR. Not a solo play.

### SERP API — KILLED

**Why:** Same as scraping — proxy infrastructure, Google arms race. SerpAPI had first-mover advantage. Very hard to enter now.

### Tesseract OCR as a Service — KILLED

**Why:** The underlying tool is being obsoleted. Six major VLM-based OCR models dropped in October 2025 (DeepSeek-OCR, PaddleOCR-VL, etc.) that dramatically outperform Tesseract. OCR.space already exists as a freemium hosted Tesseract API (25K free requests/month). Wrapping yesterday's technology.

### Calibre/Ebook Conversion — KILLED

**Why:** Too narrow. CloudConvert and ConvertAPI handle EPUB. Kindle dropped MOBI format. If you build Pandoc-as-a-Service, you get EPUB for free.

### Lighthouse/PageSpeed as a Service — KILLED

**Why:** Google's PageSpeed Insights API gives 25,000 free requests/day. Lighthouse-audit-service is open-sourced by Spotify. Free is too good.

### ExifTool as a Service — KILLED

**Why:** Feature, not a product. ExifTools.com already exists. Cloudinary includes metadata extraction. Who needs JUST metadata at API scale?

### yt-dlp as a Service — KILLED

**Why:** Legal minefield. YouTube ToS prohibits automated downloading. RIAA already forced youtube-dl takedown. Can't build a commercial API around ToS violation.

### SQLite as a Service — KILLED

**Why:** Turso (well-funded), Cloudflare D1 (free tier), val.town all exist. Can't compete with Cloudflare on hosting SQLite.

---

## Ideas That Survived Validation

Seven ideas passed initial screening. Four made it through deep validation.

| Rank | Idea | Demand Signal Strength | Competition | Solo-Dev Fit | Revenue Potential |
|------|------|----------------------|-------------|-------------|-------------------|
| **1** | **Pandoc as a Service** | Strong | Zero commercial wrapper | Excellent | $3-15K MRR |
| **2** | **MCP Compatibility Checker** | Very strong (47 quirks, 850+ issues) | Zero for cross-client | Excellent | $3-15K MRR |
| **3** | **Diagram Rendering API** | Growing (Mermaid adoption + AI agents) | No paid option exists | Good | $2-8K MRR |
| **4** | **OG Image / HTML-to-Image** | Proven ($80K/yr solo) | 6+ competitors | Good | $2-10K MRR |
| 5 | Webhook Relay | Strong (HN threads) | Hookdeck free tier narrows gap | Medium | $3-8K MRR |
| 6 | QR Code API with Analytics | Moderate | QR Tiger exists | Good | $3-8K MRR |
| 7 | Mock Data / Faker API | Moderate | Mockaroo (old/clunky) | Good | $1-5K MRR |

---

## Deep Dives: Top 4 Recommended

### 1. Pandoc as a Service

**The problem:** Pandoc converts between 40+ document formats and produces LaTeX-quality PDFs. It's the gold standard for document conversion. But deploying it is a nightmare:

- Haskell binary, ~50MB compressed
- PDF output requires LaTeX installation (2GB+ Docker image)
- Lambda layers can't fit Pandoc + LaTeX together
- Cold starts are brutal (seconds, not milliseconds)
- Compiling from source means compiling the Haskell compiler first
- Template and filter systems require filesystem access

Every developer who needs Pandoc in production ends up building the same Docker container, the same queue system, the same health checks. This is textbook wrapper API territory.

**Demand evidence:**
- Pandoc: 36K+ GitHub stars, one of the most-used CLI tools in open source
- Multiple abandoned open-source attempts at hosted Pandoc exist: mrded/pandoc-as-a-service, go-pandoc, pandoc-http, alphakevin/pandoc-api — all self-hosted Docker images with minimal stars, no commercial offering
- Old "Docverter" hosted service is dead (circa 2012)
- **No commercial hosted Pandoc API exists today**
- CloudConvert and ConvertAPI handle document conversion but are format-generic, expensive ($84/mo for 5K conversions at ConvertAPI), and don't expose Pandoc's unique features (citation engines, custom templates, filters)

**What people end up using:**
| Solution | Price | Gap |
|----------|-------|-----|
| Self-hosted Docker | Free + infra | Maintenance burden, cold starts |
| CloudConvert | $8/mo (25 conversions) to $84/mo (5K) | Generic, doesn't expose Pandoc features |
| ConvertAPI | $14/mo (250 conversions) to $84/mo (5K) | Same — format conversion, not Pandoc |
| DocRaptor | $15-$325/mo | PrinceXML, not Pandoc (limited CSS) |
| Gotenberg | Free (self-hosted) | Great but requires Docker ops |

**The specific gap:** "POST markdown with a citation style and a template, GET back a styled PDF or DOCX." Nobody sells this.

**API shape:**
```
POST /convert
{
  "from": "markdown",
  "to": "pdf",
  "content": "# My Document\n\nHello world...",
  "template": "academic",      // optional
  "csl": "apa",                // optional citation style
  "bibliography": "refs.bib"   // optional
}

→ 200 OK (application/pdf)
```

**Who would pay:**
- Developers building report generators
- SaaS products that export to PDF/DOCX
- Academic tools and publishers (citation support is unique)
- AI agents generating documents (MCP server, LangChain tool)
- Documentation pipelines (markdown repo → styled PDF)

**Infrastructure:**
- Docker container with Pandoc + LaTeX (~2GB image, but only built once)
- $20-40/mo VPS handles significant volume
- Warm container pool for low latency
- Could use pandoc/core (280MB) for non-PDF conversions, LaTeX only for PDF

**Pricing model:**
| Tier | Price | Conversions |
|------|-------|-------------|
| Free | $0 | 50/month |
| Starter | $19/mo | 1,000/month |
| Pro | $49/mo | 5,000/month |
| Business | $99/mo | 20,000/month |
| Pay-as-you-go | $0.01/conversion | Overflow |

**Revenue comps:** DocRaptor (PrinceXML wrapper, $15-325/mo, running since 2010), CloudConvert (200+ formats, significant revenue), ConvertAPI (similar). Document conversion is a $4B+ market.

**Passes the 7-characteristic test:**
1. Wraps something technically annoying? **Yes** — Haskell binary + LaTeX in production
2. Open-source core exists? **Yes** — Pandoc is GPL, 36K stars
3. Simple input/output? **Yes** — content in, document out
4. Production reliability is the product? **Yes** — cold starts, timeouts, font rendering
5. Usage-based pricing natural? **Yes** — per-conversion metering
6. High switching costs? **Yes** — once integrated, nobody rewrites
7. Near-zero marginal cost? **Medium** — heavier than screenshot APIs but manageable

**Risk factors:**
- Docker container management is real ops work (not pure serverless)
- Pandoc version updates could break customer templates
- LaTeX rendering can be slow for complex documents (need queue/async pattern)
- Gotenberg (free, self-hosted) is "good enough" for teams with Docker ops capability

**Verdict: STRONG GO.** Best ratio of "real pain" to "zero competition" to "proven economics" on this list.

**Score: 8/10**

---

### 2. MCP Cross-Client Compatibility Checker

**Full analysis in [product-review-and-recs.md](./product-review-and-recs.md).** Summary here for comparison:

**The problem:** MCP servers break silently across different clients (Claude Desktop, Cursor, VS Code, Windsurf, Zed, etc.). Config key names differ, schema validation strictness varies, transport support is inconsistent, and there's no tool that tests the compatibility matrix.

**Demand evidence:**
- 47 documented quirks across 25 categories and 10+ clients
- 850+ GitHub issues mentioning testing/quality/validation across MCP repos
- #1 end-user complaint on Cursor Forum: "works in Claude but not Cursor"
- Claude Code v2.0.21+ strict schema validation broke hundreds of previously-working servers
- 30,000-100,000 estimated active MCP server developers worldwide

**Competition:** Zero for cross-client compatibility testing specifically. General MCP testing has 9+ tools but all test against one client.

**API shape:**
```
npx mcp-compat check ./my-server

✓ Protocol compliance
✓ Claude Desktop compatibility
✗ Cursor — config key should be "mcpServers" not "servers"
✗ Claude Code — oneOf not supported in input_schema
⚠ Windsurf — tool description under 20 chars (silently ignored)
```

**Pricing:** Free CLI → paid dashboard ($15-30/mo) for monitoring, CI badge, team access.

**Risk:** Anthropic ships comprehensive validation tooling. 6-month window before official MCP Registry quality audits (Q4 2026).

**Verdict: STRONG GO.** Most validated demand signal of anything on this list. Direct skills transfer from ProofSlip.

**Score: 8/10**

---

### 3. Diagram Rendering API (Mermaid/D2/PlantUML)

**The problem:** Rendering diagrams from text markup (Mermaid, PlantUML, D2, Graphviz) requires either a headless browser (Mermaid) or a JVM (PlantUML) or a Go binary (D2). No paid, reliable, API-first diagram rendering service exists.

**Demand evidence:**
- Mermaid Chart raised $7.5M seed (Sequoia, Microsoft M12) — validates the market, but they're chasing the editor/collaboration market, not the API market
- GitHub, GitLab render Mermaid natively — massive adoption driving demand
- Kroki.io is free and covers 20+ diagram formats, but:
  - No SLA, no paid tier
  - Funded by Exoscale sponsorship (fragile)
  - Known rendering failures (HTTP 400 errors)
  - URL length limits for GET requests
  - No guaranteed uptime
- mermaid.ink is free but unreliable with documented rendering issues
- AI agents generating diagrams is an exploding use case — LangChain's `draw_mermaid_png` already uses mermaid.ink and has open bugs about reliability

**What people end up using:**
| Solution | Price | Gap |
|----------|-------|-----|
| kroki.io | Free | No SLA, sponsorship-funded, known failures |
| mermaid.ink | Free | Unreliable, community project |
| Self-hosted Mermaid CLI | Free + infra | Headless browser, same as screenshot APIs |
| Mermaid Chart | $8-16/mo | Editor, not API. No programmatic rendering endpoint. |

**The specific gap:** No paid, reliable, API-first diagram rendering. Kroki is charity-funded. Mermaid Chart is an editor. The API niche is entirely unmonetized.

**API shape:**
```
POST /render
{
  "type": "mermaid",
  "code": "graph TD\n  A-->B\n  B-->C",
  "format": "svg",
  "theme": "dark"
}

→ 200 OK (image/svg+xml)
```

**Who would pay:**
- Documentation pipelines (render diagrams in CI/CD)
- SaaS products showing architecture/flow diagrams
- AI agents generating visual output
- Developers tired of kroki.io's reliability issues
- Slack/Discord bots that render diagrams inline

**Infrastructure:**
- Headless browser for Mermaid (same pattern as screenshot APIs — proven)
- JVM for PlantUML (heavier, could start without)
- Go binary for D2 (lightweight)
- Start Mermaid-only, expand based on demand

**Pricing:**
| Tier | Price | Renders |
|------|-------|---------|
| Free | $0 | 100/month |
| Starter | $12/mo | 2,000/month |
| Pro | $29/mo | 10,000/month |
| Business | $59/mo | 50,000/month |

**Risk factors:**
- Kroki.io is "good enough" for many use cases (free is a strong competitor)
- Mermaid Chart could pivot to offer an API
- Smaller TAM than document conversion

**Verdict: GO.** Clear gap, low competition, low infra cost. Could be a great first product that bootstraps quickly.

**Score: 7/10**

---

### 4. OG Image / HTML-to-Image API

**The problem:** Every blog post, product page, and tweet needs a social preview image. Vercel's Satori (@vercel/og) is free but limited — flexbox only (no grid), no variable fonts, 500KB bundle limit, restricted CSS subset. Full HTML/CSS rendering requires headless Chrome, which is painful to run in production.

**Demand evidence:**
- 4 competing Show HN posts for OG image APIs in the past year — signals both strong demand AND market saturation
- Satori/Vercel OG limitations are well-documented pain points
- htmlcsstoimage proves the model (small team, profitable, used by Dev.to and Product Hunt)
- ApiFlash: $79.7K/yr, 1 person, running since 2018
- ScreenshotOne: ~$25K MRR, 1 person, 800+ customers
- The category supports 10+ profitable competitors simultaneously

**What people end up using:**
| Solution | Price | Gap |
|----------|-------|-----|
| Satori/@vercel/og | Free | Limited CSS, flexbox only, 500KB limit |
| htmlcsstoimage | Paid (specifics unclear) | Full Chrome rendering, established |
| ScreenshotOne | $17/mo for 2K | 200+ params, established |
| ApiFlash | $7-49/mo | Solo dev, sub-1s response |
| PixShot | Free 500/mo, $19/mo | Newest entrant, single VPS |
| CaptureKit | $7/mo for 1K | Budget option |

**The gap (narrowed):** Every price point is covered. The remaining angles:
- **Template marketplace** — pre-built, customizable OG image templates (no HTML needed)
- **Framework-specific SDK** — Next.js, Astro, SvelteKit helpers that "just work"
- **AI-generated OG images** — describe what you want, get an OG image (niche but novel)

**Risk factors:**
- 6+ direct competitors at every price point
- 4 new entrants in the past year (Show HN posts)
- Satori keeps improving (could close the gap)
- Headless Chrome compute costs eat margins
- Proven economics but slow ramp (ScreenshotOne took 4 years to reach $25K MRR)

**Verdict: CONDITIONAL GO.** The economics are proven and the ramp is predictable, but you'd be the 7th+ entrant in a crowded field. Only pursue if you have a clear differentiator (template marketplace, AI angle, or framework-native SDK). Otherwise, it's a 3-4 year grind to reach meaningful revenue.

**Score: 6/10**

---

## Comparison Matrix

### Head-to-Head: Top 4

| Factor | Pandoc API | MCP Compat | Diagram API | OG Image API |
|--------|-----------|------------|-------------|--------------|
| **Demand evidence** | Strong (36K stars, no commercial wrapper) | Very strong (47 quirks, 850+ issues) | Growing (Mermaid adoption + AI) | Proven ($80K/yr solo exists) |
| **Competition** | Zero commercial | Zero for cross-client | No paid option | 6+ competitors |
| **Time to MVP** | 3-4 weeks | 2-4 weeks | 2-3 weeks | 2-3 weeks |
| **Infra complexity** | Medium (Docker, LaTeX) | Low (CLI tool) | Low-medium (headless browser) | Medium (headless Chrome) |
| **Revenue ceiling** | $3-15K MRR | $3-15K MRR | $2-8K MRR | $2-10K MRR |
| **Timing risk** | Low (Pandoc isn't going anywhere) | Medium (6-mo window) | Low (kroki.io isn't improving) | Low (proven category) |
| **Anthropic/platform risk** | None | Medium (official tooling) | None | None |
| **Skills from ProofSlip** | Some (API design, Vercel) | Direct (MCP protocol, npm) | Some (API design) | Some (API design) |
| **Agent/AI tailwind** | Strong (doc generation) | Strong (MCP ecosystem) | Strong (diagram generation) | Moderate (OG images) |
| **"Set and forget" potential** | Medium (Pandoc updates) | Low (client quirks evolve) | High (rendering is stable) | High (screenshots are stable) |

### Pick Your Path

**If you want the safest bet with proven economics:**
→ OG Image API (but accept the crowded market and slow ramp)

**If you want the best demand-to-competition ratio:**
→ Pandoc as a Service (zero competition, clear pain, large market)

**If you want to leverage ProofSlip skills directly:**
→ MCP Compatibility Checker (direct skills transfer, fastest to ship)

**If you want the lowest-effort first product:**
→ Diagram Rendering API (smallest scope, clearest gap, low infra)

### The Combo Play

These ideas aren't mutually exclusive. A credible path:

1. **Start with MCP Compat** (weeks 1-4) — fastest to ship, leverages existing skills, validates you can build + distribute + get users
2. **Add Diagram Rendering** (months 2-3) — similar technical pattern (headless rendering), expands beyond MCP niche
3. **Build Pandoc API** (months 3-5) — biggest market, anchors a "developer tools" brand

Each product builds on the previous: CLI experience → rendering infrastructure → document processing pipeline.

---

## Pre-Build Validation Checklist

Use this before building ANY of these ideas (or any future API business):

### Phase 1: Problem Validation (Before Writing Code)

- [ ] **Find 10+ people describing the pain in their own words.** Forum posts, GitHub issues, HN threads. If you can't find them, the pain isn't acute enough.
- [ ] **Map what they ended up using.** If everyone uses the same tool, that tool owns the problem.
- [ ] **Check if "free" is good enough.** Open-source self-hosted options that are easy to deploy kill wrapper APIs. Pandoc is hard to deploy (good). ESLint is easy to deploy (bad for a wrapper).
- [ ] **Verify the vocabulary.** Your product name must match how developers describe the problem. Don't invent a category — enter an existing one.
- [ ] **Test "feature or product?"** If every platform could add this as a checkbox, it's a feature, not a product.

### Phase 2: Market Validation (Before Building Infra)

- [ ] **Find 3 people who'd pay.** Not "interesting" — actually "I'd pay $X/month."
- [ ] **Size the niche.** npm downloads, GitHub stars, forum activity as proxies. Need at least 10K potential users for a micro-SaaS.
- [ ] **Check timing.** Is an official/free solution coming? If yes, you have a window, not a moat.
- [ ] **Map acquisition path.** Where do target users hang out? How will they find you? "They'll Google it" is not a plan.
- [ ] **Define the retention hook.** What brings users back? Usage-based APIs have natural retention (integrated in code), but dashboards need engagement loops.

### Phase 3: MVP Scoping (Before Building Features)

- [ ] **One endpoint, one command.** What's the single thing that makes someone say "I need this"?
- [ ] **Day-one content plan.** One blog post/guide that genuinely helps people AND leads to your tool.
- [ ] **Cold start plan.** How does it deliver value with zero other users?
- [ ] **Pricing with friction.** Free tier generous enough to prove value, constrained enough to create upgrade pressure.
- [ ] **4-week deadline.** Ship MVP in 4 weeks or descope.

---

## Sources & References

### Solo-Dev API Business Data
- [ApiFlash Revenue (IndieHackers)](https://www.indiehackers.com/product/apiflash)
- [ScreenshotOne Revenue](https://www.indiehackers.com/product/screenshotone-the-best-screenshot-api/revenue)
- [Restpack $500K Exit](https://boringcashcow.com/showcase/the-lucrative-world-of-boring-screenshot-api-businesses)
- [Geocodio $550K/yr](https://www.indiehackers.com/product/geocodio)
- [IPinfo.io $3.7M/yr](https://getlatka.com/companies/ipinfo)
- [ScrapingBee Eight-Figure Exit](https://www.indiehackers.com/product/scrapingbee)
- [Stripe: 44% of Profitable SaaS = Solo Founders](https://stripe.com/reports/developer-coefficient)
- [SaaS Acquisitions Up 73.5% (Flippa)](https://flippa.com/blog/saas-acquisition-trends-2025)
- [Acquire.com $500M+ in Deals](https://acquire.com/press)

### Demand Validation Sources
- [HN: Webhook Reliability in Production](https://news.ycombinator.com/item?id=44407429)
- [HN: Give Me /events Not Webhooks](https://news.ycombinator.com/item?id=27823109)
- [HN: Webhooks Are Harder Than They Seem](https://news.ycombinator.com/item?id=42309742)
- [HN: PixShot — Screenshot and OG Image API](https://news.ycombinator.com/item?id=47160127)
- [HN: OG Image API](https://news.ycombinator.com/item?id=46235341)
- [Statsig: Free Feature Flags Forever](https://www.statsig.com/blog/introducing-free-feature-flags)
- [Claude Code Issue #10606 — Strict Schema Validation](https://github.com/anthropics/claude-code/issues/10606)

### Competitor Research
- [Ziptax Pricing](https://www.zip.tax/pricing)
- [TaxCloud: Best Sales Tax APIs](https://taxcloud.com/blog/sales-tax-apis/)
- [Hookdeck Pricing](https://hookdeck.com/pricing)
- [Svix Pricing](https://www.svix.com/pricing/)
- [htmlcsstoimage Pricing](https://htmlcsstoimage.com/pricing)
- [ScreenshotOne Pricing](https://screenshotone.com/pricing/)
- [Mermaid Chart Raises $7.5M (TechCrunch)](https://techcrunch.com/2024/03/20/mermaid-chart-a-markdown-like-tool-for-creating-diagrams-raises-5-5m/)
- [Kroki.io](https://kroki.io/)
- [CloudConvert Pricing](https://cloudconvert.com/pricing)
- [ConvertAPI Pricing](https://www.convertapi.com/prices)
- [DocRaptor](https://docraptor.com/)
- [Rendi — FFmpeg API](https://www.rendi.dev)

### Market Context
- [Document Generation Market ($4B+)](https://apitemplate.io/blog/document-generation-automation-statistics-and-trends/)
- [OCR Models Shifting to VLMs (2025)](https://www.e2enetworks.com/blog/complete-guide-open-source-ocr-models-2025)
- [Vertex: 681 US Tax Rate Changes in 2025](https://www.vertexinc.com/resources/resource-library/record-year-us-sales-tax-rate-changes)
- [MCP Ecosystem: 11,150+ Servers (PulseMCP)](https://www.pulsemcp.com/statistics)
- [Agentic AI Market: $5-8B → $180-200B](https://www.marketsandmarkets.com/Market-Reports/agentic-ai-market-208190735.html)

---

*Generated 2026-04-06. Market conditions change on ~3-month cycles. Verify pricing and competitor status before committing to any idea.*
