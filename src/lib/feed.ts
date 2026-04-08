// lib/feed.ts
// Runs only on the server. Zero client-side JS.

export interface Article {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  category: string;
}

// Radio Farda RSS feeds by section
const FEEDS: Record<string, string> = {
  latest:   "https://www.radiofarda.com/api/zbkqviqpmpu",
  iran:     "https://www.radiofarda.com/api/zypiqmqrqtp",
  world:    "https://www.radiofarda.com/api/zyuiqmqrqtp",
  economy:  "https://www.radiofarda.com/api/ztmiqmqrqtp",
  culture:  "https://www.radiofarda.com/api/zcoiqmqrqtp",
};

// Fallback: Radio Farda main RSS (public, no API key)
const FALLBACK_FEED = "https://www.radiofarda.com/api/zbkqviqpmpu";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseXml(xml: string): Article[] {
  const items: Article[] = [];

  // Simple regex-based XML parser — no library dependency
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

  for (const match of itemMatches) {
    const item = match[1];

    const title = stripHtml(
      (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
        item.match(/<title>(.*?)<\/title>/) ||
        [])[1] || ""
    );

    const link = (
      (item.match(/<link>(.*?)<\/link>/) ||
        item.match(/<guid[^>]*>(.*?)<\/guid>/) ||
        [])[1] || ""
    ).trim();

    const pubDate = (
      (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || ""
    ).trim();

    const description = stripHtml(
      (item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
        item.match(/<description>([\s\S]*?)<\/description>/) ||
        [])[1] || ""
    ).slice(0, 280); // hard cap — no heavy descriptions

    const category = stripHtml(
      (item.match(/<category><!\[CDATA\[(.*?)\]\]><\/category>/) ||
        item.match(/<category>(.*?)<\/category>/) ||
        [])[1] || ""
    );

    if (title && link) {
      items.push({ title, link, pubDate, description, category });
    }
  }

  return items;
}

export async function fetchFeed(section = "latest"): Promise<Article[]> {
  const url = FEEDS[section] || FALLBACK_FEED;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }, // cache 5 min on server
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FardaLite/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const xml = await res.text();
    return parseXml(xml);
  } catch (e) {
    console.error("Feed fetch error:", e);
    return [];
  }
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
