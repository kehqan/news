// lib/audio.ts — Server-side only.
// Scrapes Radio Farda article pages to extract the _low.mp3 audio URL.
// These are hosted on Akamai CDN and load fast even on slow connections.

export interface AudioInfo {
  lowUrl: string;   // _low.mp3 — smallest, ~2–3 MB per hour of content
  normUrl: string;  // standard mp3
  hqUrl: string;    // _hq.mp3 — highest quality
  durationSec: number;
}

// Titles that always have audio — used to flag items in feed list
const AUDIO_TITLE_PATTERNS = [
  "سرخط خبرها",
  "ساعت ۱",
  "ساعت ۲",
  "ساعت ۶",
  "ساعت ۷",
  "ساعت ۸",
  "ساعت ۹",
  "پوشش ویژه",
  "پادکست",
  "لایه هفتم",
  "رادیو فردا",
  "برنامه رادیویی",
];

export function isAudioArticle(title: string): boolean {
  return AUDIO_TITLE_PATTERNS.some((p) => title.includes(p));
}

function cleanMp3Url(raw: string): string {
  // Strip HTML entities that sometimes appear in the scraped source
  return raw
    .replace(/&quot;/g, "")
    .replace(/&amp;/g, "&")
    .split('"')[0]
    .split("'")[0]
    .trim();
}

export async function fetchAudioInfo(articleUrl: string): Promise<AudioInfo | null> {
  try {
    const res = await fetch(articleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
        "Accept-Language": "fa,en;q=0.9",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Extract the three quality variants
    // Pattern: https://rfe-audio-ns.akamaized.net/...{_low|_hq|}.mp3
    const lowMatches = html.match(/https:\/\/rfe-audio-ns\.akamaized\.net\/[^\s"'<>]+_low\.mp3/g) || [];
    const hqMatches  = html.match(/https:\/\/rfe-audio-ns\.akamaized\.net\/[^\s"'<>]+_hq\.mp3/g) || [];
    // Standard (no suffix): match .mp3 not followed by ? and not preceded by _low or _hq
    const normMatches = [...html.matchAll(/https:\/\/rfe-audio-ns\.akamaized\.net\/[^\s"'<>]+\.mp3/g)]
      .map((m) => m[0])
      .filter((u) => !u.includes("_low") && !u.includes("_hq"));

    if (lowMatches.length === 0 && normMatches.length === 0) return null;

    const lowUrl  = cleanMp3Url(lowMatches[0] || normMatches[0] || "");
    const normUrl = cleanMp3Url(normMatches[0] || lowMatches[0] || "");
    const hqUrl   = cleanMp3Url(hqMatches[0] || normMatches[0] || lowMatches[0] || "");

    // Try to extract duration from JSON-LD or data attributes
    let durationSec = 0;
    const durMatch =
      html.match(/"duration"\s*:\s*"PT(\d+)M(\d+)S"/) ||
      html.match(/duration['":\s]+(\d+)/);
    if (durMatch) {
      if (durMatch[2]) {
        durationSec = parseInt(durMatch[1]) * 60 + parseInt(durMatch[2]);
      } else {
        durationSec = parseInt(durMatch[1]);
      }
    }

    return { lowUrl, normUrl, hqUrl, durationSec };
  } catch (e) {
    console.error("Audio fetch error:", e);
    return null;
  }
}

export function formatDuration(sec: number): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Estimate audio file size from duration
// _low.mp3 ≈ 32 kbps = 4 KB/s
export function estimateAudioKB(durationSec: number): string {
  if (!durationSec) return "~۲–۳ مگابایت";
  const kb = Math.round((durationSec * 32 * 1000) / 8 / 1024);
  if (kb > 1024) return `~${(kb / 1024).toFixed(1)} مگابایت`;
  return `~${kb} کیلوبایت`;
}
