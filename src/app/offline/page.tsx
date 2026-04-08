// src/app/offline/page.tsx
// Served when the site is unreachable. Static, no JS.

export default function OfflinePage() {
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <a href="/" className="site-name">فردا سبک</a>
        </div>
      </header>
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <p style={{ fontSize: "1.1rem", marginBottom: "16px" }}>
          اتصال به اینترنت برقرار نیست
        </p>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", maxWidth: "340px", margin: "0 auto 20px" }}>
          این سایت نیاز به اتصال اینترنت دارد. اگر در ایران هستید، ممکن است به VPN نیاز داشته باشید.
        </p>
        <a href="/" style={{ 
          display: "inline-block",
          border: "1px solid var(--border)",
          padding: "7px 16px",
          borderRadius: "3px",
          fontSize: "0.85rem",
          color: "var(--link)"
        }}>
          تلاش مجدد
        </a>
      </div>
      <footer className="site-footer">
        <span>فردا سبک — نسخه کم‌مصرف</span>
      </footer>
    </>
  );
}
