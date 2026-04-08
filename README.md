# فردا سبک — Farda Lite

A bandwidth-minimal Persian news reader built on Radio Farda's RSS feeds.
Designed for Iranian users with throttled or restricted internet access.

---

## How it works

- Fetches **RSS XML** from Radio Farda **on the server** every 5 minutes
- Scrapes article text server-side — the user's browser never contacts radiofarda.com
- Strips everything: no images, no video, no ads, no trackers, no JS
- Delivers **raw HTML** (~4–8 KB per page) over the wire
- Works on **2G / EDGE** connections

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — latest news with section tabs |
| `/?s=iran` | Filtered section (iran, world, economy, culture) |
| `/article?url=...` | Article proxy — full text, no images |
| `/search?q=...` | Keyword search across all sections |
| `/offline` | Shown when connection is lost |

## Bandwidth per page load

| Component | Size |
|---|---|
| HTML (gzipped) | 3–8 KB |
| CSS | 0 (inline, zero extra requests) |
| JavaScript | **0 KB** |
| Images | **0 KB** |
| Fonts | **0 KB** (uses device's system Persian fonts) |
| **Total per page** | **3–8 KB** |

Radio Farda homepage = ~5,000–8,000 KB. This is **500–1000× lighter**.

---

## Run locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## Deploy to Vercel (recommended — free)

```bash
npm install -g vercel
vercel login
vercel --prod
```

Or: push to GitHub → import at vercel.com → one click deploy.

Your URL will be something like `farda-lite.vercel.app`.

## Deploy with custom domain

Point a short domain to Vercel in their dashboard.  
Shorter URL = fewer bytes when shared via Telegram or WhatsApp.

---

## Deploy to cPanel (static export)

Add `output: 'export'` to `next.config.js`, then:

```bash
npm run build
# Upload /out folder to public_html via File Manager or FTP
```

Note: static export loses server-side revalidation. News won't auto-refresh.
Use Vercel for automatic 5-minute cache refresh.

---

## Project structure

```
src/
  app/
    layout.tsx          ← Global shell: inline CSS, RTL, zero external requests
    page.tsx            ← Homepage: RSS feed list with section nav + search
    not-found.tsx       ← 404 page
    article/
      page.tsx          ← Article proxy: scrapes & renders full article text
    search/
      page.tsx          ← Keyword search across all sections
    offline/
      page.tsx          ← Fallback for no connection
    api/
      news/route.ts     ← JSON API returning stripped headlines
  lib/
    feed.ts             ← RSS fetcher + XML parser (no dependencies)
    article.ts          ← Article HTML scraper + text extractor
```

---

## RSS feed URLs

| Section | Feed URL |
|---|---|
| Latest | https://www.radiofarda.com/api/zbkqviqpmpu |
| Iran | https://www.radiofarda.com/api/zypiqmqrqtp |
| World | https://www.radiofarda.com/api/zyuiqmqrqtp |
| Economy | https://www.radiofarda.com/api/ztmiqmqrqtp |
| Culture | https://www.radiofarda.com/api/zcoiqmqrqtp |

If feed URLs change, update `src/lib/feed.ts`.

---

## Legal

Read-only RSS aggregator. Does not host or copy Radio Farda content —
links directly to the original articles. RSS feeds are publicly available.
