// src/app/x-admin/login/route.ts
// POST handler: validates credentials, sets session cookie, redirects to dashboard.

import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_USER, ADMIN_PASS,
  createSessionToken, COOKIE_NAME, COOKIE_MAX_AGE
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const user = (form.get("user") as string || "").trim();
  const pass = (form.get("pass") as string || "").trim();

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    // Wrong credentials — redirect back to login with error
    return NextResponse.redirect(new URL("/x-admin?error=1", req.url));
  }

  const token = createSessionToken(user);
  const res = NextResponse.redirect(new URL("/x-admin/dashboard", req.url));
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/x-admin",
  });
  return res;
}
