// src/app/api/news/route.ts — Stripped JSON API
import { NextRequest, NextResponse } from "next/server";
import { fetchFeed, FEEDS } from "@/lib/feed";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get("s") || "latest";
  const valid = FEEDS[section] ? section : "latest";
  const articles = await fetchFeed(valid);

  const stripped = articles.map((a) => ({
    t: a.title,
    l: a.link,
    d: a.pubDate,
    c: a.category,
    s: a.description,
  }));

  return NextResponse.json(stripped, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
