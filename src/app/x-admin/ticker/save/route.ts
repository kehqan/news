// src/app/x-admin/ticker/save/route.ts
// POST — saves updated ticker config. Auth-gated.

import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { writeTicker, type TickerStore } from "@/lib/ticker";

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as TickerStore;

    // Sanitise
    const store: TickerStore = {
      items: (body.items || [])
        .filter((i) => i.text && i.text.trim().length > 0)
        .map((i) => ({
          id: i.id || crypto.randomUUID(),
          text: i.text.trim().slice(0, 300),
          sourceUrl: i.sourceUrl?.trim() || undefined,
          addedAt: i.addedAt || new Date().toISOString(),
          active: Boolean(i.active),
        }))
        .slice(0, 30), // max 30 items
      separator: ["🔴", "◆", "●", "▸", "—", "·", "★", "⚡"].includes(body.separator)
        ? body.separator : "🔴",
      speed: ["slow", "normal", "fast"].includes(body.speed) ? body.speed : "normal",
      updatedAt: new Date().toISOString(),
    };

    await writeTicker(store);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Ticker save error:", e);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
