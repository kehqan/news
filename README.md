# فردا سبک — Farda Lite

> A bandwidth-minimal Persian news reader for Iranians with restricted internet access.
> Built on Radio Farda's public RSS feeds. Delivers full news content at **~5 KB per page** — roughly 800× lighter than radiofarda.com.

---

## Why this exists

Iranians accessing the internet through throttled connections, VPNs, or censorship filters face a real barrier: news websites are heavy. RadioFarda.com loads **4–8 MB** per page — images, videos, tracking scripts, ad networks. On a throttled connection that can mean 30–60 seconds per page, if it loads at all.

Farda Lite strips everything down to what matters: the words. No images. No video. No JavaScript. No external fonts. No ads. Just news.

---

## Bandwidth comparison

| | Farda Lite | RadioFarda.com |
|---|---|---|
| Homepage | ~5 KB | ~5,000 KB |
| Article page | ~3–8 KB | ~4,000 KB |
| Audio program | 0 KB until play | full autoload |
| JavaScript | **0 KB** | ~800 KB |
| Fonts | **0 KB** (system fonts) | ~200 KB |
| Images | **0 KB** | ~2,000 KB |
| **Ratio** | **1×** | **~800×** |

---

## Features

- **News feed** — All Radio Farda sections: ایران، جهان، اقتصاد، سیاسی، اجتماعی، فرهنگ، تحلیل
- **Article proxy** — Full article text fetched server-side. User's browser never contacts radiofarda.com directly
- **Audio programs** — سرخط خبرها، ساعت ۱۴، پوشش ویژه and all radio programs playable inline as voice-message style bubbles. Low-quality stream (~32 kbps) loads only on play
- **Keyword search** — Searches across all sections simultaneously, server-rendered
- **News ticker** — Scrolling breaking news bar at the top of every page, admin-controlled
- **Admin panel** — Hidden at `/x-admin`, password-protected. Manage ticker headlines, pick from live feed or write manually

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Rendering | 100% server-side — zero client JS |
| Styling | Inline CSS, no framework |
| Fonts | System Persian fonts only — zero downloads |
| Data | Radio Farda RSS feeds + article scraping |
| Storage | Vercel KV (Redis) for ticker persistence |
| Hosting | Vercel (free tier) |
| Language | TypeScript |

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # Global shell — inline CSS, RTL, news ticker
│   ├── page.tsx                # Homepage — news feed with section nav
│   ├── not-found.tsx           # 404
│   ├── article/page.tsx        # Article proxy — scrapes & renders full text + audio
│   ├── audio/page.tsx          # Audio programs listing
│   ├── search/page.tsx         # Keyword search across all sections
│   ├── offline/page.tsx        # No-connection fallback
│   ├── api/
│   │   ├── news/route.ts       # Public JSON API for headlines
│   │   └── ticker/route.ts     # Public ticker data API
│   └── x-admin/
│       ├── page.tsx            # Login page
│       ├── dashboard/page.tsx  # Admin dashboard — feed health, stats
│       ├── ticker/
│       │   ├── page.tsx        # Ticker management UI
│       │   └── save/route.ts   # POST handler to save ticker
│       ├── login/route.ts      # Auth POST handler
│       └── logout/route.ts     # Session clear
└── lib/
    ├── feed.ts                 # RSS fetcher + XML parser
    ├── article.ts              # Article HTML scraper
    ├── audio.ts                # Audio URL extractor
    ├── ticker.ts               # Ticker storage (Vercel KV)
    └── auth.ts                 # Session auth
```

---

## RSS feeds used

All feeds verified working. Source: `radiofarda.com/rssfeeds`

| Section | Feed URL |
|---|---|
| Latest | `https://www.radiofarda.com/api/` |
| Iran | `https://www.radiofarda.com/api/zpoqil-vomx-tpe_kip` |
| World | `https://www.radiofarda.com/api/zmoqpl-vomx-tpeykim` |
| Economy | `https://www.radiofarda.com/api/zrqpml-vomx-tpeou_p` |
| Culture | `https://www.radiofarda.com/api/zpvmmol-vomx-tpe_qvmp` |
| Politics | `https://www.radiofarda.com/api/z-oqml-vomx-tpergim` |
| Social | `https://www.radiofarda.com/api/zboq_l-vomx-tpeqgi_` |
| Analysis | `https://www.radiofarda.com/api/zptimql-vomx-tpe_o_mi` |

---

## Local development

```bash
# 1. Clone
git clone https://github.com/kehqan/news
cd news

# 2. Install
npm install

# 3. Run
npm run dev
# → http://localhost:3000
```

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Or connect the GitHub repo to Vercel for automatic deploys on every push.

### Environment variables

Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Description | Default |
|---|---|---|
| `ADMIN_USER` | Admin login username | `kasra` |
| `ADMIN_PASS` | Admin login password | `farda2026!` |
| `SESSION_SECRET` | Random string for session tokens | (set a strong value) |
| `KV_REST_API_URL` | Vercel KV endpoint (auto-set by Vercel) | — |
| `KV_REST_API_TOKEN` | Vercel KV token (auto-set by Vercel) | — |

### Vercel KV setup (for persistent ticker)

1. Vercel Dashboard → your project → **Storage**
2. **Create Database** → KV → name it `farda-kv`
3. **Connect to project** — Vercel auto-injects the KV env vars

Without KV, the ticker defaults to a welcome message and resets on cold starts.

---

## Admin panel

URL: `/x-admin` — not linked from anywhere public.

| Feature | Description |
|---|---|
| Dashboard | Feed health for all 8 sections, article counts, stats |
| Ticker management | Add/edit/reorder/toggle breaking news headlines |
| Feed picker | One-click add any current headline to the ticker |
| Manual entry | Write any custom breaking news text |
| Separator chooser | 🔴 ◆ ● ▸ — · ★ ⚡ |
| Speed control | آرام / معمولی / سریع |
| Live preview | See the ticker animate as you edit |

---

## Legal

This is a read-only RSS aggregator. It does not host, store, or redistribute Radio Farda content. It fetches publicly available RSS feeds and links directly back to original articles. All content belongs to RFE/RL.

Audio files are streamed directly from RFE/RL's Akamai CDN — no proxy, no re-hosting.

---

## License

MIT — free to use, modify, and deploy.
