// lib/auth.ts — Minimal session auth for admin panel.
// Credentials stored in env vars — set these in Vercel dashboard.

import { cookies } from "next/headers";

// Read from environment — set ADMIN_USER and ADMIN_PASS in Vercel
export const ADMIN_USER = process.env.ADMIN_USER || "kasra";
export const ADMIN_PASS = process.env.ADMIN_PASS || "farda2026!";
const SESSION_SECRET = process.env.SESSION_SECRET || "x-farda-admin-secret-change-this";
const COOKIE_NAME = "farda_admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

// Simple HMAC-less token: base64(user:timestamp:secret_hash)
// Good enough for a personal admin panel — not a banking app.
export function createSessionToken(user: string): string {
  const ts = Date.now();
  const raw = `${user}:${ts}:${SESSION_SECRET}`;
  return Buffer.from(raw).toString("base64url");
}

export function validateSessionToken(token: string): boolean {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf-8");
    const parts = raw.split(":");
    if (parts.length < 3) return false;
    const [, tsStr, ...secretParts] = parts;
    const secret = secretParts.join(":");
    if (secret !== SESSION_SECRET) return false;
    const ts = parseInt(tsStr);
    const age = Date.now() - ts;
    return age < COOKIE_MAX_AGE * 1000;
  } catch { return false; }
}

export function isAdminAuthenticated(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return validateSessionToken(token);
}

export { COOKIE_NAME, COOKIE_MAX_AGE };
