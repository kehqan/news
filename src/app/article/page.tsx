// src/app/article/page.tsx — Proxy article renderer. Zero client JS.

import { fetchArticle, formatDateFa } from "@/lib/article";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  searchParams: { url?: string; ref?: string };
}

export default async function ArticlePage({ searchParams }: PageProps) {
  const rawUrl = searchParams.url;
  const ref = searchParams.ref || "";
  if (!rawUrl) notFound();

  let articleUrl: string;
  try {
    articleUrl = Buffer.from(decodeURIComponent(rawUrl), "base64").toString("utf-8");
  } catch { notFound(); }

  const article = await fetchArticle(articleUrl!);
  const backHref = ref ? `/?s=${ref}` : "/";

  // Estimate page size: ~150 bytes base + 50 bytes per paragraph avg 120 chars
  const estimatedKB = Math.round((150 + article.body.reduce((a, p) => a + p.length, 0)) / 1024 * 10) / 10 || 2;

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-name">فردا سبک</Link>
          <span className="site-tagline">متن خبر</span>
          <Link href="/search" className="search-link">جستجو</Link>
        </div>
      </header>

      <div className="status-bar">
        <Link href={backHref} style={{ color: "var(--muted)", fontSize: "0.75rem", textDecoration: "none" }}>
          ← بازگشت به اخبار
        </Link>
        <span className="bandwidth-badge">≈ {estimatedKB} کیلوبایت</span>
      </div>

      <article style={{ paddingTop: "16px" }}>
        {(!article.title && article.error) ? (
          <div className="empty">
            <p style={{ color: "var(--danger)", marginBottom: "12px" }}>{article.error}</p>
            <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" className="read-original">
              باز کردن در رادیو فردا ↗
            </a>
          </div>
        ) : (
          <>
            <h1 className="article-page-title">{article.title}</h1>

            <div className="article-page-meta">
              {article.pubDate && <span>{formatDateFa(article.pubDate)}</span>}
              {article.author && (
                <span style={{ borderRight: "1px solid var(--border)", paddingRight: "10px" }}>
                  {article.author}
                </span>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", margin: "12px 0" }} />

            {article.error && (
              <p style={{
                fontSize: "0.78rem", color: "var(--danger)",
                background: "#1a0f0f", border: "1px solid #3a1a1a",
                borderRadius: "3px", padding: "8px 12px", marginBottom: "14px"
              }}>{article.error}</p>
            )}

            <div className="article-page-body">
              {article.body.map((para, i) => (
                <p key={i} style={{ marginBottom: "1.1rem" }}>{para}</p>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "8px" }}>
              <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" className="read-original">
                خواندن نسخه کامل در رادیو فردا ↗
              </a>
              <p style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: "6px" }}>
                باز کردن نسخه اصلی مصرف اینترنت بیشتری دارد
              </p>
            </div>
          </>
        )}
      </article>

      <footer className="site-footer">
        <Link href={backHref} style={{ color: "var(--muted)" }}>← بازگشت</Link>
        <span>منبع: radiofarda.com</span>
      </footer>
    </>
  );
}
