// src/app/search/page.tsx — Server-rendered search. Zero client JS.

import { fetchFeed, FEEDS, formatDate, type Article } from "@/lib/feed";
import Link from "next/link";

function proxyUrl(articleLink: string): string {
  const encoded = Buffer.from(articleLink).toString("base64");
  return `/article?url=${encodeURIComponent(encoded)}&ref=search`;
}

interface PageProps {
  searchParams: { q?: string };
}

export const revalidate = 300;

export default async function SearchPage({ searchParams }: PageProps) {
  const query = (searchParams.q || "").trim();
  let results: Article[] = [];

  if (query.length >= 2) {
    const feeds = await Promise.all(Object.keys(FEEDS).map((s) => fetchFeed(s)));
    const all = feeds.flat();
    const seen = new Set<string>();
    const unique = all.filter((a) => { if (seen.has(a.link)) return false; seen.add(a.link); return true; });
    const q = query.toLowerCase();
    results = unique.filter(
      (a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-name">فردا سبک</Link>
          <span className="site-tagline">جستجو</span>
        </div>
        <nav className="nav"><Link href="/">← اخبار</Link></nav>
      </header>

      <form method="GET" action="/search" style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input type="search" name="q" defaultValue={query} placeholder="جستجو در اخبار..."
            autoComplete="off" dir="rtl" style={{
              flex: 1, background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "3px", padding: "7px 10px", fontSize: "0.9rem",
              color: "var(--text)", fontFamily: "inherit",
            }} />
          <button type="submit" style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px",
            padding: "7px 14px", fontSize: "0.85rem", color: "var(--text)", cursor: "pointer", fontFamily: "inherit",
          }}>جستجو</button>
        </div>
      </form>

      {query.length >= 2 ? (
        <>
          <div className="status-bar">
            <span>{results.length > 0 ? `${results.length} نتیجه برای «${query}»` : `نتیجه‌ای برای «${query}» یافت نشد`}</span>
          </div>
          {results.length === 0 ? (
            <div className="empty"><p>کلمه دیگری امتحان کنید.</p></div>
          ) : (
            <ul className="article-list">
              {results.map((article, i) => (
                <li key={i} className="article-item">
                  <h2 className="article-title">
                    <Link href={proxyUrl(article.link)}>{article.title}</Link>
                  </h2>
                  <div className="article-meta">
                    {article.pubDate && <span>{formatDate(article.pubDate)}</span>}
                    {article.category && <span className="article-cat">{article.category}</span>}
                    <a href={article.link} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: "0.68rem", color: "var(--muted)" }}>نسخه اصلی ↗</a>
                  </div>
                  {article.description && <p className="article-desc">{article.description}</p>}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div className="empty" style={{ paddingTop: "24px" }}>
          <p style={{ fontSize: "0.85rem" }}>حداقل ۲ حرف وارد کنید.</p>
        </div>
      )}

      <footer className="site-footer">
        <Link href="/" style={{ color: "var(--muted)" }}>← بازگشت به اخبار</Link>
        <span>بدون تصویر · بدون ویدیو</span>
      </footer>
    </>
  );
}
