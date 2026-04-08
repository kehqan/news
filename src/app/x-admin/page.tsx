// src/app/x-admin/page.tsx — Login page. Not linked from anywhere public.

import { isAdminAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: { error?: string };
}

export default function AdminLoginPage({ searchParams }: PageProps) {
  // Already logged in — send to dashboard
  if (isAdminAuthenticated()) redirect("/x-admin/dashboard");

  const hasError = searchParams.error === "1";

  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>ورود</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          :root {
            --bg: #0d0d0d; --surface: #161616; --border: #2a2a2a;
            --text: #e8e6e0; --muted: #7a7870; --accent: #c8a84b;
            --danger: #cc4444; --success: #4a9a4a;
          }
          html, body {
            font-family: "Vazirmatn","Tahoma",system-ui,sans-serif;
            background: var(--bg); color: var(--text);
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
          }
          .card {
            background: var(--surface); border: 1px solid var(--border);
            border-radius: 6px; padding: 32px 28px; width: 100%; max-width: 340px;
          }
          .logo { font-size: 1.1rem; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
          .sub  { font-size: 0.75rem; color: var(--muted); margin-bottom: 24px; }
          label { display: block; font-size: 0.78rem; color: var(--muted); margin-bottom: 5px; }
          input {
            width: 100%; background: var(--bg); border: 1px solid var(--border);
            border-radius: 4px; padding: 8px 10px; font-size: 0.9rem;
            color: var(--text); font-family: inherit; margin-bottom: 14px;
          }
          input:focus { outline: none; border-color: var(--accent); }
          button {
            width: 100%; background: var(--accent); color: #0d0d0d; border: none;
            border-radius: 4px; padding: 9px; font-size: 0.9rem; font-weight: 700;
            cursor: pointer; font-family: inherit; margin-top: 4px;
          }
          button:hover { opacity: 0.9; }
          .error {
            background: #1a0f0f; border: 1px solid #3a1a1a; border-radius: 4px;
            padding: 8px 10px; font-size: 0.78rem; color: var(--danger); margin-bottom: 14px;
          }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="logo">فردا سبک</div>
          <div className="sub">پنل مدیریت — دسترسی محدود</div>
          {hasError && <div className="error">نام کاربری یا رمز اشتباه است.</div>}
          <form method="POST" action="/x-admin/login">
            <label htmlFor="user">نام کاربری</label>
            <input id="user" name="user" type="text" autoComplete="username" required dir="ltr" />
            <label htmlFor="pass">رمز عبور</label>
            <input id="pass" name="pass" type="password" autoComplete="current-password" required dir="ltr" />
            <button type="submit">ورود</button>
          </form>
        </div>
      </body>
    </html>
  );
}
