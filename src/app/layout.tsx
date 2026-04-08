// src/app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "فردا | اخبار",
  description: "نسخه سبک رادیو فردا — بدون تصویر، بدون ویدیو",
  viewport: "width=device-width, initial-scale=1",
  // No og:image to keep weight down
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* ZERO external font requests — system Persian fonts only */}
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0a0a0a" />
        <style dangerouslySetInnerHTML={{ __html: `
          /* ── Reset ─────────────────────────────────── */
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          
          /* ── System font stack for Persian ─────────── */
          /* Uses whatever Persian font the device has — zero download */
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

          /* ── Typography ─────────────────────────────── */
          h1 { font-size: 1.4rem; font-weight: 700; line-height: 1.4; }
          h2 { font-size: 1.1rem; font-weight: 600; line-height: 1.5; }
          p  { font-size: 0.95rem; line-height: 1.8; }

          a {
            color: var(--link);
            text-decoration: none;
          }
          a:hover { text-decoration: underline; }

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

          .article-title a {
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

          /* ── External link badge ─────────────────────── */
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
        {children}
      </body>
    </html>
  );
}
