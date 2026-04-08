// lib/feed.ts — Server-side only. Zero client JS.

export interface Article {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  category: string;
  imageUrl: string;
  hasAudio: boolean;   // ← NEW: flagged from title pattern
}

export const FEEDS: Record<string, { url: string; label: string }> = {
  latest:   { url: "https://www.radiofarda.com/api/",                       label: "آخرین اخبار" },
  iran:     { url: "https://www.radiofarda.com/api/zpoqil-vomx-tpe_kip",    label: "ایران" },
  world:    { url: "https://www.radiofarda.com/api/zmoqpl-vomx-tpeykim",    label: "جهان" },
  economy:  { url: "https://www.radiofarda.com/api/zrqpml-vomx-tpeou_p",   label: "اقتصاد" },
  culture:  { url: "https://www.radiofarda.com/api/zpvmmol-vomx-tpe_qvmp", label: "فرهنگ" },
  politics: { url: "https://www.radiofarda.com/api/z-oqml-vomx-tpergim",   label: "سیاسی" },
  social:   { url: "https://www.radiofarda.com/api/zboq_l-vomx-tpeqgi_",   label: "اجتماعی" },
  analysis: { url: "https://www.radiofarda.com/api/zptimql-vomx-tpe_o_mi", label: "تحلیل" },
};

const AUDIO_PATTERNS = [
  "سرخط خبرها", "ساعت ۱", "ساعت ۲", "ساعت ۶", "ساعت ۷",
  "ساعت ۸", "ساعت ۹", "پوشش ویژه", "پادکست", "لایه هفتم",
  "رادیو فردا", "برنامه رادیویی",
];

function hasAudioTitle(title: string): boolean {
  return AUDIO_PATTERNS.some((p) => title.includes(p));
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&#x([\da-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function clean(s: string): string {
  return decodeHtml(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function parseXml(xml: string): Article[] {
  const items: Article[] = [];
  const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const m of matches) {
    const item = m[1];
    const title = clean(
      (item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
       item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ""
    );
    const link = (
      (item.match(/<link>([\s\S]*?)<\/link>/) ||
       item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/) || [])[1] || ""
    ).trim();
    const pubDate = ((item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || "").trim();
    const description = clean(
      (item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
       item.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || ""
    ).slice(0, 320);
    const cats = [...item.matchAll(/<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g)]
      .map(c => clean(c[1])).filter(c => c && c !== "بایگانی").slice(0, 2);
    const category = cats.join(" · ");
    const imageUrl = ((item.match(/<enclosure[^>]+url="([^"]+)"/) || [])[1] || "").trim();
    if (title && link) {
      items.push({ title, link, pubDate, description, category, imageUrl, hasAudio: hasAudioTitle(title) });
    }
  }
  return items;
}

export async function fetchFeed(section = "latest"): Promise<Article[]> {
  const feed = FEEDS[section] || FEEDS.latest;
  try {
    const res = await fetch(feed.url, {
      next: { revalidate: 300 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FardaLite/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "Accept-Language": "fa,en;q=0.9",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseXml(await res.text());
  } catch (e) {
    console.error(`Feed error [${section}]:`, e);
    return [];
  }
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return dateStr; }
}
