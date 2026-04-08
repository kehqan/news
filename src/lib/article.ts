// lib/article.ts — Server-side only. Scrapes Radio Farda article text.
// Uses the confirmed 'wsw' CSS class that contains article body.

export interface ScrapedArticle {
  title: string;
  body: string[];
  pubDate: string;
  author: string;
  originalUrl: string;
  error?: string;
}

function isSafeUrl(url: string): boolean {
  try {
    const p = new URL(url);
    return p.protocol === "https:" &&
      (p.hostname === "www.radiofarda.com" || p.hostname === "radiofarda.com");
  } catch { return false; }
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&#x([\da-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractMeta(html: string, prop: string): string {
  const m =
    html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i")) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, "i")) ||
    html.match(new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"));
  return m ? decodeHtml(m[1].trim()) : "";
}

function extractParagraphs(html: string): string[] {
  // Radio Farda confirmed body class: "wsw"
  // Strategy: find the wsw div, extract all <p> inside it
  const wswMatch = html.match(/class="wsw"[^>]*>([\s\S]*?)(?:<\/div>\s*<\/div>|<div class="[^"]*related)/i);
  const bodyHtml = wswMatch ? wswMatch[1] : html;

  const pTags = [...bodyHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const paragraphs = pTags
    .map((m) => decodeHtml(stripTags(m[1])))
    .filter((p) => p.length > 15 && !p.includes("حقوق این وب‌سایت")); // skip copyright line

  if (paragraphs.length > 0) return paragraphs.slice(0, 40);

  // Fallback: grab all <p> from full HTML
  const allP = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => decodeHtml(stripTags(m[1])))
    .filter((p) => p.length > 30 && !p.includes("حقوق این وب‌سایت"));
  return allP.slice(0, 30);
}

export async function fetchArticle(url: string): Promise<ScrapedArticle> {
  if (!isSafeUrl(url)) {
    return { title: "", body: [], pubDate: "", author: "", originalUrl: url, error: "آدرس مجاز نیست." };
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "fa,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    const title = decodeHtml(
      extractMeta(html, "og:title") ||
      stripTags((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "") ||
      stripTags((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "")
    );

    const pubDate =
      extractMeta(html, "article:published_time") ||
      extractMeta(html, "og:updated_time") || "";

    const author =
      extractMeta(html, "author") ||
      decodeHtml(stripTags(
        (html.match(/<span[^>]+class="[^"]*author[^"]*"[^>]*>([\s\S]*?)<\/span>/i) || [])[1] || ""
      ));

    const body = extractParagraphs(html);

    if (body.length === 0) {
      return { title, body: [], pubDate, author, originalUrl: url,
        error: "متن مقاله استخراج نشد. لطفاً نسخه اصلی را باز کنید." };
    }

    return { title, body, pubDate, author, originalUrl: url };
  } catch (e) {
    console.error("Article fetch error:", e);
    return { title: "", body: [], pubDate: "", author: "", originalUrl: url,
      error: "خطا در دریافت مقاله از رادیو فردا." };
  }
}

export function formatDateFa(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}
