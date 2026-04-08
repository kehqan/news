// src/app/article/page.tsx
// Proxies a Radio Farda article through our server.
// The user's browser never contacts radiofarda.com.
// Fully server-rendered. Zero client JS.

import { fetchArticle, formatDateFa } from "@/lib/article";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  searchParams: { url?: string; ref?: string };
}

export async function generateMetadata({ searchParams }: PageProps) {
  return {
    title: "در حال بارگذاری... | فردا سبک",
  };
}

export default async function ArticlePage({ searchParams }: PageProps) {
  const rawUrl = searchParams.url;
  const refSection = searchParams.ref || "";

  if (!rawUrl) notFound();

  // Decode the URL (it comes base64-encoded to avoid query string issues)
  let articleUrl: string;
  try {
    articleUrl = Buffer.from(rawUrl, "base64").toString("utf-8");
  } catch {
    notFound();
  }

  const article = await fetchArticle(articleUrl);

  const backHref = refSection ? `/?s=${refSection}` : "/";

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-name">فردا سبک</Link>
          <span className="site-tagline">نسخه کم‌مصرف رادیو فردا</span>
        </div>
      </header>

      <div className="status-bar">
        <Link href={backHref} className="back-link" style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
          ← بازگشت به اخبار
        </Link>
        <span className="bandwidth-badge">≈ ۳ کیلوبایت</span>
      </div>

      <article className="article-page-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
        {article.error && !article.title ? (
          <div className="empty">
            <p style={{ color: "var(--danger)", marginBottom: "12px" }}>{article.error}</p>
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="read-original"
            >
              باز کردن نسخه اصلی در رادیو فردا ↗
            </a>
          </div>
        ) : (
          <>
            <h1 className="article-page-title">{article.title}</h1>

            <div className="article-page-meta">
              {article.pubDate && (
                <span>{formatDateFa(article.pubDate)}</span>
              )}
              {article.author && (
                <span style={{ borderRight: "1px solid var(--border)", paddingRight: "10px" }}>
                  {article.author}
                </span>
              )}
            </div>

            {/* Separator */}
            <div style={{ borderTop: "1px solid var(--border)", margin: "14px 0" }} />

            {/* Error notice if partial */}
            {article.error && (
              <p style={{
                fontSize: "0.78rem",
                color: "var(--danger)",
                background: "#1a0f0f",
                border: "1px solid #3a1a1a",
                borderRadius: "3px",
                padding: "8px 12px",
                marginBottom: "16px"
              }}>
                {article.error}
              </p>
            )}

            {/* Article body */}
            {article.body.length > 0 ? (
              <div className="article-page-body">
                {article.body.map((para, i) => (
                  <p key={i} style={{ marginBottom: "1rem" }}>{para}</p>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "16px" }}>
                متن مقاله در دسترس نیست.
              </p>
            )}

            {/* Link to original */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
              <a
                href={article.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="read-original"
              >
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
