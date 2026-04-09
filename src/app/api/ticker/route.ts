// src/app/api/ticker/route.ts
// Public API — returns active ticker items.
// Called server-side by layout.tsx to embed ticker at render time.

import { NextResponse } from "next/server";
import { readTicker } from "@/lib/ticker";

export const revalidate = 0; // always fresh — admin can update anytime

export async function GET() {
  const store = await readTicker();
  return NextResponse.json(store, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
