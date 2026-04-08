// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-name">فردا سبک</Link>
        </div>
      </header>
      <div className="empty" style={{ paddingTop: "40px" }}>
        <p style={{ fontSize: "1.1rem", marginBottom: "12px" }}>صفحه یافت نشد</p>
        <Link href="/" style={{ fontSize: "0.85rem", color: "var(--link)" }}>
          ← بازگشت به صفحه اصلی
        </Link>
      </div>
    </>
  );
}
