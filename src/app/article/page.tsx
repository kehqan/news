// src/app/article/page.tsx — Proxy article renderer. Zero client JS (audio is native HTML).

import { fetchArticle, formatDateFa } from "@/lib/article";
import { fetchAudioInfo, isAudioArticle, formatDuration, estimateAudioKB } from "@/lib/audio";
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

  // Fetch article text + audio info in parallel
  const [article, audioInfo] = await Promise.all([
    fetchArticle(articleUrl!),
    isAudioArticle(
      // We don't have the title yet, so peek from URL slug — good enough heuristic
      articleUrl!
    ) ? fetchAudioInfo(articleUrl!) : Promise.resolve(null),
  ]);

  // Re-check with actual title once we have it
  const hasAudio = isAudioArticle(article.title);
  const audio = hasAudio && !audioInfo ? await fetchAudioInfo(articleUrl!) : audioInfo;

  const backHref = ref ? `/?s=${ref}` : "/";
  const estimatedKB = Math.round(
    (150 + article.body.reduce((a, p) => a + p.length, 0)) / 1024 * 10
  ) / 10 || 2;

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-name">فردا سبک</Link>
          <span className="site-tagline">{hasAudio ? "برنامه صوتی" : "متن خبر"}</span>
          <Link href="/search" className="search-link">جستجو</Link>
        </div>
      </header>

      <div className="status-bar">
        <Link href={backHref} style={{ color: "var(--muted)", fontSize: "0.75rem", textDecoration: "none" }}>
          ← بازگشت
        </Link>
        <span className="bandwidth-badge">
          متن: ≈ {estimatedKB} KB
          {audio?.durationSec ? ` | صدا: ${estimateAudioKB(audio.durationSec)}` : ""}
        </span>
      </div>

      <article style={{ paddingTop: "16px" }}>
        {(!article.title && article.error) ? (
          <div className="empty">
            <p style={{ color: "var(--danger)", marginBottom: "12px" }}>{article.error}</p>
            <a href={articleUrl!} target="_blank" rel="noopener noreferrer" className="read-original">
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

            {/* ── Audio player — shown when article has audio ── */}
            {audio && audio.lowUrl && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: "8px" }}>
                  🎙 برنامه صوتی
                  {audio.durationSec > 0 && ` — ${formatDuration(audio.durationSec)}`}
                </div>

                {/* Voice-message bubble */}
                <div style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "18px",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "8px",
                }}>
                  <span style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    background: "var(--accent)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: "15px",
                  }}>🎙</span>

                  {/*
                    preload="none" = zero bytes until user presses play.
                    Only the _low.mp3 is offered first — ~32kbps, voice-quality,
                    exactly like a voice message in a messenger app.
                  */}
                  <audio
                    controls
                    preload="none"
                    style={{
                      flex: 1, height: "34px", minWidth: 0,
                      accentColor: "var(--accent)",
                    }}
                  >
                    <source src={audio.lowUrl} type="audio/mpeg" />
                    {audio.normUrl && audio.normUrl !== audio.lowUrl && (
                      <source src={audio.normUrl} type="audio/mpeg" />
                    )}
                    مرورگر شما از پخش صدا پشتیبانی نمی‌کند.
                  </audio>
                </div>

                {/* Quality choice */}
                <div style={{ display: "flex", gap: "14px", fontSize: "0.68rem", flexWrap: "wrap" }}>
                  <a href={audio.lowUrl} download style={{ color: "var(--muted)" }}>
                    ↓ دانلود کیفیت پایین ({estimateAudioKB(audio.durationSec)})
                  </a>
                  {audio.hqUrl && audio.hqUrl !== audio.lowUrl && (
                    <a href={audio.hqUrl} download style={{ color: "var(--muted)" }}>
                      ↓ کیفیت بالا
                    </a>
                  )}
                </div>

                <div style={{ borderTop: "1px solid var(--border)", margin: "16px 0 0" }} />
              </div>
            )}

            {/* ── Article body text ── */}
            {article.error && (
              <p style={{
                fontSize: "0.78rem", color: "var(--danger)",
                background: "#1a0f0f", border: "1px solid #3a1a1a",
                borderRadius: "3px", padding: "8px 12px", marginBottom: "14px"
              }}>{article.error}</p>
            )}

            {article.body.length > 0 ? (
              <div className="article-page-body">
                {article.body.map((para, i) => (
                  <p key={i} style={{ marginBottom: "1.1rem" }}>{para}</p>
                ))}
              </div>
            ) : (
              !audio && (
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "16px" }}>
                  متن مقاله در دسترس نیست.
                </p>
              )
            )}

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "8px" }}>
              <a href={articleUrl!} target="_blank" rel="noopener noreferrer" className="read-original">
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
        <Link href="/audio" style={{ color: "var(--muted)" }}>🎙 همه برنامه‌های صوتی</Link>
        <span>منبع: radiofarda.com</span>
      </footer>
    </>
  );
}
