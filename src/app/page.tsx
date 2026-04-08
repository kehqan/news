// src/app/page.tsx — Fully server-rendered. Zero client JS.

import { fetchFeed, FEEDS, formatDate, type Article } from "@/lib/feed";
import Link from "next/link";

function proxyUrl(articleLink: string, section: string): string {
  const encoded = Buffer.from(articleLink).toString("base64");
  return `/article?url=${encodeURIComponent(encoded)}&ref=${section}`;
}

// Rough gzipped HTML estimate per article item: ~300 bytes
function estimatePageKB(count: number): string {
  const bytes = 3200 + count * 310; // base shell + per-item
  return (bytes / 1024).toFixed(1);
}

interface PageProps {
  searchParams: { s?: string };
}

export const revalidate = 300;

export default async function HomePage({ searchParams }: PageProps) {
  const section = searchParams.s && FEEDS[searchParams.s] ? searchParams.s : "latest";
  const articles = await fetchFeed(section);
  const now = new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  const pageKB = estimatePageKB(articles.length);

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-name">فردا سبک</Link>
          <span className="site-tagline">نسخه کم‌مصرف رادیو فردا</span>
          <Link href="/search" className="search-link">جستجو</Link>
        </div>
        <nav className="nav">
          {Object.entries(FEEDS).map(([key, { label }]) => (
            <Link key={key} href={`/?s=${key}`} className={section === key ? "active" : ""}>
              {label}
            </Link>
          ))}
        </nav>
      </header>

      {/* ── Bandwidth bar ─────────────────────────────── */}
      <div className="status-bar">
        <span>بروزرسانی: {now} | {articles.length} خبر</span>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>مصرف این صفحه:</span>
          <span className="bandwidth-badge">≈ {pageKB} KB</span>
          <span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>
            در مقابل {">"}4,000 KB رادیو فردا
          </span>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="empty">
          <p>خبری یافت نشد. لطفاً دوباره تلاش کنید.</p>
          <p style={{ marginTop: "8px", fontSize: "0.78rem" }}>ممکن است به VPN نیاز داشته باشید.</p>
        </div>
      ) : (
        <ul className="article-list">
          {articles.map((article: Article, i: number) => (
            <li key={i} className="article-item">
              <h2 className="article-title">
                <Link href={proxyUrl(article.link, section)}>{article.title}</Link>
              </h2>
              <div className="article-meta">
                {article.pubDate && <span>{formatDate(article.pubDate)}</span>}
                {article.category && <span className="article-cat">{article.category}</span>}
                <a href={article.link} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                  نسخه اصلی ↗
                </a>
              </div>
              {article.description && (
                <p className="article-desc">{article.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <footer className="site-footer">
        <span>منبع: <a href="https://www.radiofarda.com" target="_blank" rel="noopener noreferrer">RadioFarda.com</a></span>
        <span>بدون تصویر · بدون ویدیو · بدون تبلیغ</span>
      </footer>
      <p className="vpn-note">⚠ در صورت عدم دسترسی به این سایت از ایران، از VPN استفاده کنید.</p>
    </>
  );
}
