// src/app/api/news/route.ts
// Returns stripped JSON — headlines + links only.
// Can be used by future offline-capable PWA or curl.

import { NextRequest, NextResponse } from "next/server";
import { fetchFeed } from "@/lib/feed";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get("s") || "latest";
  const articles = await fetchFeed(section);

  // Strip to absolute minimum — title + link + date only
  const stripped = articles.map((a) => ({
    t: a.title,
    l: a.link,
    d: a.pubDate,
    c: a.category,
  }));

  return NextResponse.json(stripped, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
