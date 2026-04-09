// src/app/layout.tsx
import type { Metadata } from "next";
import { readTicker } from "@/lib/ticker";

export const metadata: Metadata = {
  title: "فردا | اخبار",
  description: "نسخه سبک رادیو فردا — بدون تصویر، بدون ویدیو",
  viewport: "width=device-width, initial-scale=1",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch ticker server-side — no client JS needed
  const ticker = await readTicker().catch(() => null);
  const activeItems = ticker?.items.filter((i) => i.active) ?? [];
  const sep = ticker?.separator ?? "🔴";
  const speed = ticker?.speed ?? "normal";

  // CSS animation duration: slow=45s, normal=25s, fast=12s
  const dur = speed === "slow" ? "45s" : speed === "fast" ? "12s" : "25s";

  // Build the scrolling text — duplicate for seamless loop
  const tickerText = activeItems
    .map((item) => `${item.text}`)
    .join(`  ${sep}  `);

  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0a0a0a" />
        <style dangerouslySetInnerHTML={{ __html: `
          /* ── Reset ─────────────────────────────────── */
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          :root {
            --bg: #0d0d0d;
            --surface: #161616;
            --border: #2a2a2a;
            --text: #e8e6e0;
            --muted: #7a7870;
            --accent: #c8a84b;
            --accent-dim: #8a7030;
            --link: #a8c4e0;
            --tag-bg: #1e1e1e;
            --danger: #cc4444;
          }

          html {
            font-family:
              "Vazirmatn", "Vazir", "IranSans", "B Nazanin",
              "Tahoma", "Arial Unicode MS",
              system-ui, sans-serif;
            font-size: 16px;
            line-height: 1.7;
            background: var(--bg);
            color: var(--text);
          }

          body {
            min-height: 100vh;
            max-width: 680px;
            margin: 0 auto;
            padding: 0 16px;
          }

          /* ── News ticker ─────────────────────────────── */
          .ticker-bar {
            background: var(--accent);
            color: #0d0d0d;
            height: 32px;
            overflow: hidden;
            display: flex;
            align-items: center;
            position: relative;
            margin: 0 -16px;             /* bleed past body padding */
            padding: 0;
          }

          .ticker-label {
            background: #0d0d0d;
            color: var(--accent);
            font-size: 0.65rem;
            font-weight: 800;
            letter-spacing: 0.06em;
            padding: 0 10px;
            height: 100%;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            z-index: 2;
            white-space: nowrap;
            border-left: 2px solid var(--accent);
          }

          .ticker-track-wrap {
            flex: 1;
            overflow: hidden;
            height: 100%;
            display: flex;
            align-items: center;
          }

          /* The track holds the text twice for seamless loop.
             Pure CSS keyframe — zero JavaScript. */
          .ticker-track {
            display: flex;
            align-items: center;
            white-space: nowrap;
            animation: ticker-rtl ${dur} linear infinite;
            will-change: transform;
          }

          /* RTL crawl: text moves right-to-left (enters from left, exits to right) */
          @keyframes ticker-rtl {
            0%   { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }

          .ticker-item {
            font-size: 0.78rem;
            font-weight: 700;
            padding: 0 14px;
            color: #0d0d0d;
          }

          .ticker-sep {
            font-size: 0.72rem;
            opacity: 0.65;
            flex-shrink: 0;
          }

          /* Pause on hover — accessibility + readability */
          .ticker-bar:hover .ticker-track {
            animation-play-state: paused;
          }

          /* ── Header ─────────────────────────────────── */
          .site-header {
            border-bottom: 1px solid var(--border);
            padding: 14px 0 10px;
            margin-bottom: 0;
            position: sticky;
            top: 0;
            background: var(--bg);
            z-index: 10;
          }

          .site-header-inner {
            display: flex;
            align-items: baseline;
            gap: 12px;
            flex-wrap: wrap;
          }

          .site-name {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--accent);
            letter-spacing: 0.05em;
            text-decoration: none;
          }
          .site-name:hover { text-decoration: none; color: var(--accent); }

          .site-tagline {
            font-size: 0.72rem;
            color: var(--muted);
            border-right: 1px solid var(--border);
            padding-right: 10px;
          }

          /* ── Nav ─────────────────────────────────────── */
          .nav {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
            padding: 8px 0 6px;
            border-bottom: 1px solid var(--border);
          }

          .nav a {
            font-size: 0.78rem;
            color: var(--muted);
            padding: 3px 8px;
            border-radius: 3px;
            border: 1px solid transparent;
          }
          .nav a:hover, .nav a.active {
            color: var(--text);
            border-color: var(--border);
            background: var(--surface);
            text-decoration: none;
          }
          .nav a.active {
            color: var(--accent);
            border-color: var(--accent-dim);
          }

          /* ── Article list ────────────────────────────── */
          .article-list { list-style: none; }

          .article-item {
            border-bottom: 1px solid var(--border);
            padding: 14px 0;
          }
          .article-item:last-child { border-bottom: none; }

          .article-title a, .article-title a:visited {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text);
            line-height: 1.5;
          }
          .article-title a:hover { color: var(--accent); text-decoration: none; }

          .article-meta {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            align-items: center;
            margin-top: 4px;
            font-size: 0.72rem;
            color: var(--muted);
          }

          .article-cat {
            background: var(--tag-bg);
            border: 1px solid var(--border);
            padding: 1px 6px;
            border-radius: 2px;
            font-size: 0.68rem;
            color: var(--muted);
          }

          .article-desc {
            margin-top: 5px;
            font-size: 0.85rem;
            color: var(--muted);
            line-height: 1.6;
          }

          .ext-badge {
            display: inline-block;
            font-size: 0.68rem;
            color: var(--muted);
            border: 1px solid var(--border);
            padding: 1px 5px;
            border-radius: 2px;
            margin-right: 6px;
            vertical-align: middle;
          }

          /* ── Status / info bar ───────────────────────── */
          .status-bar {
            font-size: 0.72rem;
            color: var(--muted);
            padding: 6px 0;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 6px;
          }

          .bandwidth-badge {
            font-size: 0.65rem;
            background: #1a2a1a;
            color: #5a9a5a;
            border: 1px solid #2a4a2a;
            padding: 2px 7px;
            border-radius: 2px;
          }

          /* ── Empty state ─────────────────────────────── */
          .empty {
            padding: 40px 0;
            text-align: center;
            color: var(--muted);
            font-size: 0.9rem;
          }

          /* ── Footer ──────────────────────────────────── */
          .site-footer {
            border-top: 1px solid var(--border);
            margin-top: 24px;
            padding: 12px 0 20px;
            font-size: 0.72rem;
            color: var(--muted);
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 8px;
          }

          .vpn-note {
            font-size: 0.7rem;
            color: var(--danger);
            padding: 8px 0 0;
          }

          /* ── Article page ────────────────────────────── */
          .article-page-header {
            padding: 20px 0 14px;
            border-bottom: 1px solid var(--border);
            margin-bottom: 16px;
          }
          .article-page-title {
            font-size: 1.3rem;
            font-weight: 700;
            line-height: 1.5;
            color: var(--text);
            margin-bottom: 10px;
          }
          .article-page-meta {
            font-size: 0.75rem;
            color: var(--muted);
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
          .article-page-body {
            font-size: 0.95rem;
            line-height: 1.85;
            color: var(--text);
            margin-bottom: 24px;
          }
          .read-original {
            display: inline-block;
            font-size: 0.82rem;
            border: 1px solid var(--border);
            padding: 7px 14px;
            border-radius: 3px;
            color: var(--link);
            margin-bottom: 20px;
          }
          .read-original:hover {
            background: var(--surface);
            text-decoration: none;
          }
          .back-link {
            font-size: 0.78rem;
            color: var(--muted);
            display: inline-block;
            margin-bottom: 16px;
          }
          .back-link:hover { color: var(--text); text-decoration: none; }
          .search-link {
            margin-right: auto;
            font-size: 0.75rem;
            color: var(--muted);
            border: 1px solid var(--border);
            padding: 2px 8px;
            border-radius: 3px;
          }
          .search-link:hover { color: var(--text); text-decoration: none; border-color: var(--muted); }
        `}} />
      </head>
      <body>
        {/* ── News ticker bar — rendered server-side, pure CSS animation ── */}
        {activeItems.length > 0 && (
          <div className="ticker-bar" role="marquee" aria-label="خط خبری">
            <div className="ticker-label">فوری</div>
            <div className="ticker-track-wrap">
              {/*
                Two identical spans inside the track.
                The track animates from -50% to 0%, which moves one full copy
                of the content. When it reaches 0%, it snaps back to -50% seamlessly.
              */}
              <div className="ticker-track">
                {/* Copy A */}
                <span className="ticker-item">
                  {activeItems.map((item, i) => (
                    <span key={`a-${i}`}>
                      {i > 0 && <span className="ticker-sep">&nbsp;{sep}&nbsp;</span>}
                      {item.sourceUrl
                        ? <a href={item.sourceUrl} style={{ color: "#0d0d0d", textDecoration: "none" }}>{item.text}</a>
                        : <>{item.text}</>
                      }
                    </span>
                  ))}
                </span>
                {/* Gap between copies */}
                <span className="ticker-sep" style={{ padding: "0 20px" }}>{sep}</span>
                {/* Copy B — for seamless loop */}
                <span className="ticker-item">
                  {activeItems.map((item, i) => (
                    <span key={`b-${i}`}>
                      {i > 0 && <span className="ticker-sep">&nbsp;{sep}&nbsp;</span>}
                      {item.sourceUrl
                        ? <a href={item.sourceUrl} style={{ color: "#0d0d0d", textDecoration: "none" }}>{item.text}</a>
                        : <>{item.text}</>
                      }
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
