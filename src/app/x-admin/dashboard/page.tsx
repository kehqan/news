// src/app/x-admin/dashboard/page.tsx — Admin dashboard. Auth-gated.

import { isAdminAuthenticated, ADMIN_USER } from "@/lib/auth";
import { fetchFeed, FEEDS } from "@/lib/feed";
import { redirect } from "next/navigation";
import Link from "next/link";

export const revalidate = 0; // never cache admin page

export default async function AdminDashboard() {
  if (!isAdminAuthenticated()) redirect("/x-admin");

  // Fetch stats from all feeds in parallel
  const sectionKeys = Object.keys(FEEDS);
  const feedResults = await Promise.all(sectionKeys.map((s) => fetchFeed(s)));

  const stats = sectionKeys.map((key, i) => ({
    key,
    label: FEEDS[key].label,
    url: FEEDS[key].url,
    count: feedResults[i].length,
    latest: feedResults[i][0] ?? null,
  }));

  const totalArticles = feedResults.flat().length;
  const now = new Date().toLocaleString("fa-IR");
  const nowISO = new Date().toISOString();

  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>داشبورد مدیریت — فردا سبک</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          :root {
            --bg: #0d0d0d; --surface: #161616; --surface2: #1e1e1e;
            --border: #2a2a2a; --border2: #333;
            --text: #e8e6e0; --muted: #7a7870; --accent: #c8a84b;
            --green: #4a9a4a; --red: #cc4444; --blue: #4a7acc;
          }
          html, body {
            font-family: "Vazirmatn","Tahoma",system-ui,sans-serif;
            background: var(--bg); color: var(--text); font-size: 14px; line-height: 1.6;
          }
          /* ── Header ── */
          .adm-header {
            background: var(--surface); border-bottom: 1px solid var(--border);
            padding: 12px 24px; display: flex; justify-content: space-between; align-items: center;
          }
          .adm-logo { font-size: 1rem; font-weight: 700; color: var(--accent); }
          .adm-meta { font-size: 0.72rem; color: var(--muted); }
          .adm-logout {
            font-size: 0.72rem; color: var(--muted); border: 1px solid var(--border);
            padding: 4px 10px; border-radius: 3px; text-decoration: none;
          }
          .adm-logout:hover { color: var(--red); border-color: var(--red); }
          /* ── Layout ── */
          .adm-body { max-width: 960px; margin: 0 auto; padding: 24px 20px; }
          /* ── Stat cards ── */
          .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 12px; margin-bottom: 28px; }
          .stat-card {
            background: var(--surface); border: 1px solid var(--border);
            border-radius: 6px; padding: 14px 16px;
          }
          .stat-label { font-size: 0.7rem; color: var(--muted); margin-bottom: 4px; }
          .stat-value { font-size: 1.4rem; font-weight: 700; color: var(--text); }
          .stat-value.green { color: var(--green); }
          .stat-value.accent { color: var(--accent); }
          /* ── Section table ── */
          h2 { font-size: 0.85rem; color: var(--muted); text-transform: uppercase;
               letter-spacing: 0.06em; margin-bottom: 10px; }
          .feed-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
          .feed-table th {
            text-align: right; padding: 8px 10px; font-size: 0.7rem; font-weight: 600;
            color: var(--muted); border-bottom: 1px solid var(--border);
          }
          .feed-table td { padding: 10px 10px; border-bottom: 1px solid var(--border); vertical-align: top; }
          .feed-table tr:last-child td { border-bottom: none; }
          .feed-table tr:hover td { background: var(--surface2); }
          .ok-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%;
                    background: var(--green); margin-left: 6px; }
          .err-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%;
                     background: var(--red); margin-left: 6px; }
          .latest-title { color: var(--text); font-size: 0.8rem; max-width: 300px;
                          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .feed-url { font-size: 0.65rem; color: var(--muted); font-family: monospace; direction: ltr; }
          /* ── Links section ── */
          .link-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 10px; margin-top: 28px; }
          .link-card {
            background: var(--surface); border: 1px solid var(--border);
            border-radius: 6px; padding: 12px 14px; text-decoration: none;
            display: block; color: var(--text); font-size: 0.82rem;
          }
          .link-card:hover { border-color: var(--accent); color: var(--accent); }
          .link-card-label { font-size: 0.65rem; color: var(--muted); margin-bottom: 4px; }
          /* ── Feed health ── */
          .section-block { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
        `}</style>
      </head>
      <body>
        <div className="adm-header">
          <div>
            <div className="adm-logo">فردا سبک — پنل مدیریت</div>
            <div className="adm-meta">کاربر: {ADMIN_USER} | {now}</div>
          </div>
          <a href="/x-admin/logout" className="adm-logout">خروج</a>
        </div>

        <div className="adm-body">

          {/* ── Stat overview ── */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">کل مقالات فعال</div>
              <div className="stat-value accent">{totalArticles}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">تعداد بخش‌ها</div>
              <div className="stat-value">{sectionKeys.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">فیدهای فعال</div>
              <div className="stat-value green">
                {stats.filter(s => s.count > 0).length} / {sectionKeys.length}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">مصرف هر صفحه (تخمین)</div>
              <div className="stat-value green">~5 KB</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">صرفه‌جویی نسبت به رادیو فردا</div>
              <div className="stat-value green">×۸۰۰</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">آخرین بررسی</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "4px" }}>{nowISO.slice(0,19).replace("T"," ")} UTC</div>
            </div>
          </div>

          {/* ── Feed health table ── */}
          <h2>وضعیت فیدها</h2>
          <div className="section-block" style={{ marginBottom: "28px" }}>
            <table className="feed-table">
              <thead>
                <tr>
                  <th>بخش</th>
                  <th>وضعیت</th>
                  <th>تعداد خبر</th>
                  <th>آخرین خبر</th>
                  <th>آدرس فید</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.key}>
                    <td><strong>{s.label}</strong></td>
                    <td>
                      {s.count > 0
                        ? <><span className="ok-dot" />فعال</>
                        : <><span className="err-dot" />خطا</>
                      }
                    </td>
                    <td>{s.count}</td>
                    <td>
                      {s.latest
                        ? <span className="latest-title" title={s.latest.title}>{s.latest.title}</span>
                        : <span style={{ color: "var(--muted)" }}>—</span>
                      }
                    </td>
                    <td><span className="feed-url">{s.url.replace("https://www.radiofarda.com","")}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Quick links ── */}
          <h2>دسترسی سریع</h2>
          <div className="link-grid">
            <a href="/" target="_blank" className="link-card">
              <div className="link-card-label">صفحه اصلی سایت</div>
              فردا سبک ↗
            </a>
            <a href="/api/news" target="_blank" className="link-card">
              <div className="link-card-label">JSON API</div>
              /api/news ↗
            </a>
            <a href="/api/news?s=iran" target="_blank" className="link-card">
              <div className="link-card-label">API بخش ایران</div>
              /api/news?s=iran ↗
            </a>
            <a href="/search" target="_blank" className="link-card">
              <div className="link-card-label">صفحه جستجو</div>
              /search ↗
            </a>
            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener" className="link-card">
              <div className="link-card-label">هاستینگ</div>
              Vercel Dashboard ↗
            </a>
            <a href="https://www.radiofarda.com/rssfeeds" target="_blank" rel="noopener" className="link-card">
              <div className="link-card-label">منبع داده</div>
              RadioFarda RSS ↗
            </a>
            <a href="/x-admin/ticker" className="link-card" style={{ borderColor: "var(--accent)" }}>
              <div className="link-card-label">مدیریت نوار خبری</div>
              🔴 خط خبری →
            </a>
          </div>

          {/* ── Env reminder ── */}
          <div style={{
            marginTop: "28px", background: "#1a1500", border: "1px solid #3a3000",
            borderRadius: "6px", padding: "14px 16px", fontSize: "0.75rem", color: "#a89040"
          }}>
            <strong>⚠ امنیت:</strong> رمز پیشفرض را در Vercel تغییر دهید:<br />
            <span style={{ fontFamily: "monospace", direction: "ltr", display: "block", marginTop: "6px" }}>
              ADMIN_USER=your_username<br />
              ADMIN_PASS=your_strong_password<br />
              SESSION_SECRET=random_64_char_string
            </span>
          </div>

        </div>
      </body>
    </html>
  );
}
