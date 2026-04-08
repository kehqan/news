// src/app/page.tsx
// Fully server-rendered. Zero client-side JavaScript.
// Each page is ~4-8 KB over the wire.

import { fetchFeed, formatDate, type Article } from "@/lib/feed";
import Link from "next/link";

const SECTIONS: Record<string, string> = {
  latest:  "آخرین اخبار",
  iran:    "ایران",
  world:   "جهان",
  economy: "اقتصاد",
  culture: "فرهنگ",
};

// Encode article URL so it survives as a query param
function proxyUrl(articleLink: string, section: string): string {
  const encoded = Buffer.from(articleLink).toString("base64");
  return `/article?url=${encodeURIComponent(encoded)}&ref=${section}`;
}

interface PageProps {
  searchParams: { s?: string };
}

export const revalidate = 300;

export default async function HomePage({ searchParams }: PageProps) {
  const section = searchParams.s && SECTIONS[searchParams.s] ? searchParams.s : "latest";
  const articles = await fetchFeed(section);
  const now = new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-name">فردا سبک</Link>
          <span className="site-tagline">نسخه کم‌مصرف رادیو فردا</span>
          <Link href="/search" className="search-link">جستجو</Link>
        </div>
        <nav className="nav">
          {Object.entries(SECTIONS).map(([key, label]) => (
            <Link
              key={key}
              href={`/?s=${key}`}
              className={section === key ? "active" : ""}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="status-bar">
        <span>بروزرسانی: {now} | {articles.length} خبر</span>
        <span className="bandwidth-badge">≈ ۵ کیلوبایت</span>
      </div>

      {articles.length === 0 ? (
        <div className="empty">
          <p>خبری یافت نشد. لطفاً دوباره تلاش کنید.</p>
          <p style={{ marginTop: "8px", fontSize: "0.78rem" }}>
            ممکن است به VPN نیاز داشته باشید.
          </p>
        </div>
      ) : (
        <ul className="article-list">
          {articles.map((article: Article, i: number) => (
            <li key={i} className="article-item">
              <h2 className="article-title">
                {/* Primary: read via our lightweight proxy */}
                <Link href={proxyUrl(article.link, section)}>
                  {article.title}
                </Link>
              </h2>
              <div className="article-meta">
                {article.pubDate && (
                  <span>{formatDate(article.pubDate)}</span>
                )}
                {article.category && (
                  <span className="article-cat">{article.category}</span>
                )}
                {/* Secondary: direct link to original */}
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.68rem", color: "var(--muted)" }}
                  title="باز کردن در رادیو فردا (پرمصرف)"
                >
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
      <p className="vpn-note">
        ⚠ در صورت عدم دسترسی به این سایت از ایران، از VPN استفاده کنید.
      </p>
    </>
  );
}
