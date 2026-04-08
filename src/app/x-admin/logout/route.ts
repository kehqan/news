import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/x-admin", req.url));
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/x-admin" });
  return res;
}
