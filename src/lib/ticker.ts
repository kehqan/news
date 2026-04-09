// lib/ticker.ts
// Stores ticker items in /tmp/ticker.json — survives within a single Vercel
// function instance. For persistence across deployments, swap the file store
// with a KV store (Vercel KV, Upstash, etc.) by changing readTicker/writeTicker.

import { promises as fs } from "fs";
import path from "path";

const TICKER_FILE = path.join("/tmp", "farda-ticker.json");

export interface TickerItem {
  id: string;
  text: string;           // the headline text shown in the crawl
  sourceUrl?: string;     // optional link back to the article
  addedAt: string;        // ISO timestamp
  active: boolean;
}

export interface TickerStore {
  items: TickerItem[];
  separator: string;      // emoji/symbol between items, e.g. "◆" or "🔴"
  speed: "slow" | "normal" | "fast";
  updatedAt: string;
}

const DEFAULT_STORE: TickerStore = {
  items: [
    {
      id: "default-1",
      text: "به فردا سبک خوش آمدید — اخبار ایران و جهان بدون مصرف اینترنت زیاد",
      addedAt: new Date().toISOString(),
      active: true,
    },
  ],
  separator: "🔴",
  speed: "normal",
  updatedAt: new Date().toISOString(),
};

export async function readTicker(): Promise<TickerStore> {
  try {
    const raw = await fs.readFile(TICKER_FILE, "utf-8");
    return JSON.parse(raw) as TickerStore;
  } catch {
    // File doesn't exist yet — return defaults
    return DEFAULT_STORE;
  }
}

export async function writeTicker(store: TickerStore): Promise<void> {
  store.updatedAt = new Date().toISOString();
  await fs.writeFile(TICKER_FILE, JSON.stringify(store, null, 2), "utf-8");
}

// Returns only the active items as a flat string array
export async function getActiveTickerTexts(): Promise<{ text: string; url?: string }[]> {
  const store = await readTicker();
  return store.items
    .filter((i) => i.active)
    .map((i) => ({ text: i.text, url: i.sourceUrl }));
}
