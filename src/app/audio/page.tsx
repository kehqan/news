// src/app/audio/page.tsx
// Shows all audio articles from the main feed.
// The HTML5 <audio> element is the ONLY JavaScript on the page — it's native browser,
// no JS files downloaded. Page itself is fully server-rendered.

import { fetchFeed } from "@/lib/feed";
import { fetchAudioInfo, isAudioArticle, formatDuration, estimateAudioKB } from "@/lib/audio";
import Link from "next/link";

export const revalidate = 300;

export default async function AudioPage() {
  // Fetch latest feed and filter to audio articles only
  const all = await fetchFeed("latest");
  const audioItems = all.filter((a) => isAudioArticle(a.title));

  // Fetch audio URLs for each one in parallel (cached 1hr each)
  const audioInfos = await Promise.all(
    audioItems.map((a) => fetchAudioInfo(a.link))
  );

  const items = audioItems
    .map((article, i) => ({ article, info: audioInfos[i] }))
    .filter((x) => x.info !== null);

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-name">فردا سبک</Link>
          <span className="site-tagline">برنامه‌های صوتی</span>
          <Link href="/search" className="search-link">جستجو</Link>
        </div>
        <nav className="nav">
          <Link href="/">اخبار</Link>
          <Link href="/audio" className="active">صوتی</Link>
          <Link href="/search">جستجو</Link>
        </nav>
      </header>

      <div className="status-bar">
        <span>{items.length} برنامه صوتی</span>
        <span className="bandwidth-badge">کیفیت پایین — صرفه‌جو</span>
      </div>

      {items.length === 0 ? (
        <div className="empty">
          <p>برنامه صوتی یافت نشد.</p>
          <p style={{ fontSize: "0.78rem", marginTop: "8px" }}>
            ممکن است برنامه‌های امروز هنوز بارگذاری نشده باشند.
          </p>
        </div>
      ) : (
        <ul className="article-list">
          {items.map(({ article, info }, i) => (
            <li key={i} className="article-item">
              {/* Title */}
              <h2 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "8px", lineHeight: 1.5 }}>
                {article.title}
              </h2>

              {/* Meta */}
              <div className="article-meta" style={{ marginBottom: "10px" }}>
                {article.pubDate && (
                  <span style={{ fontSize: "0.72rem" }}>
                    {new Date(article.pubDate).toLocaleTimeString("fa-IR", {
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                )}
                {info!.durationSec > 0 && (
                  <span className="article-cat">{formatDuration(info!.durationSec)}</span>
                )}
                <span className="bandwidth-badge" style={{ fontSize: "0.63rem" }}>
                  {estimateAudioKB(info!.durationSec)}
                </span>
              </div>

              {/* Voice message style audio player */}
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "18px",   /* pill shape like Telegram voice message */
                padding: "10px 14px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                {/* Mic icon */}
                <span style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "var(--accent)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: "14px",
                }}>🎙</span>

                {/* Native audio — zero JS download, browser built-in */}
                <audio
                  controls
                  preload="none"       /* critical: loads NOTHING until user presses play */
                  style={{
                    flex: 1,
                    height: "32px",
                    minWidth: 0,
                    accentColor: "var(--accent)",
                  }}
                >
                  {/* Low quality first — preferred */}
                  <source src={info!.lowUrl} type="audio/mpeg" />
                  {/* Fallback to normal */}
                  {info!.normUrl && info!.normUrl !== info!.lowUrl && (
                    <source src={info!.normUrl} type="audio/mpeg" />
                  )}
                  مرورگر شما از پخش صدا پشتیبانی نمی‌کند.
                </audio>
              </div>

              {/* Quality / download links — minimal text */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "0.68rem" }}>
                <a href={info!.lowUrl} download style={{ color: "var(--muted)" }}>
                  دانلود کیفیت پایین ↓
                </a>
                {info!.hqUrl && info!.hqUrl !== info!.lowUrl && (
                  <a href={info!.hqUrl} download style={{ color: "var(--muted)" }}>
                    دانلود کیفیت بالا ↓
                  </a>
                )}
                <a href={article.link} target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--muted)" }}>
                  صفحه اصلی ↗
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="site-footer">
        <Link href="/" style={{ color: "var(--muted)" }}>← اخبار</Link>
        <span>کیفیت پایین — مصرف کمتر</span>
      </footer>
    </>
  );
}
