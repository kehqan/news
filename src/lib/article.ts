// lib/article.ts
// Server-side only. Fetches a Radio Farda article and strips it to plain text.
// The user's browser never touches radiofarda.com directly.

export interface ScrapedArticle {
  title: string;
  body: string[];        // paragraphs
  pubDate: string;
  author: string;
  originalUrl: string;
  error?: string;
}

// Only allow Radio Farda URLs — prevent open redirect / SSRF abuse
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "www.radiofarda.com" ||
        parsed.hostname === "radiofarda.com")
    );
  } catch {
    return false;
  }
}

function extractMeta(html: string, property: string): string {
  const m =
    html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i")) ||
    html.match(new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"));
  return m ? decodeHtml(m[1].trim()) : "";
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&#x([\da-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractParagraphs(html: string): string[] {
  // Try to find the article body container first
  const bodyPatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]+class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]+class="[^"]*body-text[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]+class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    // Radio Farda specific
    /<div[^>]+class="[^"]*wsw[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]+class="[^"]*story-text[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];

  let bodyHtml = "";
  for (const pat of bodyPatterns) {
    const m = html.match(pat);
    if (m && m[1] && m[1].length > 200) {
      bodyHtml = m[1];
      break;
    }
  }

  // Fall back to extracting all <p> tags from the page
  if (!bodyHtml) bodyHtml = html;

  // Extract all <p> content
  const pTags = [...bodyHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const paragraphs = pTags
    .map((m) => decodeHtml(stripTags(m[1])))
    .filter((p) => p.length > 40); // skip nav fragments, captions

  if (paragraphs.length > 0) return paragraphs.slice(0, 30); // max 30 paragraphs

  // Last resort: split on double newlines after stripping
  const stripped = stripTags(bodyHtml);
  return stripped
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40)
    .slice(0, 20);
}

export async function fetchArticle(url: string): Promise<ScrapedArticle> {
  if (!isSafeUrl(url)) {
    return {
      title: "",
      body: [],
      pubDate: "",
      author: "",
      originalUrl: url,
      error: "آدرس مجاز نیست.",
    };
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FardaLite/1.0; +https://github.com)",
        Accept: "text/html",
        "Accept-Language": "fa,en;q=0.9",
      },
      next: { revalidate: 3600 }, // cache article 1 hour
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    const title = decodeHtml(
      extractMeta(html, "og:title") ||
        (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]+>/g, "") ||
        (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] ||
        ""
    );

    const pubDate =
      extractMeta(html, "article:published_time") ||
      extractMeta(html, "og:updated_time") ||
      extractMeta(html, "date") ||
      "";

    const author =
      extractMeta(html, "author") ||
      extractMeta(html, "article:author") ||
      (html.match(/<span[^>]+class="[^"]*author[^"]*"[^>]*>([\s\S]*?)<\/span>/i) || [])[1]?.replace(/<[^>]+>/g, "").trim() ||
      "";

    const body = extractParagraphs(html);

    if (body.length === 0) {
      return {
        title: title || "خطا در دریافت مقاله",
        body: [],
        pubDate,
        author,
        originalUrl: url,
        error: "متن مقاله یافت نشد. لطفاً نسخه اصلی را باز کنید.",
      };
    }

    return { title, body, pubDate, author, originalUrl: url };
  } catch (e) {
    console.error("Article fetch error:", e);
    return {
      title: "",
      body: [],
      pubDate: "",
      author: "",
      originalUrl: url,
      error: "خطا در دریافت مقاله. ممکن است سرور دسترسی را محدود کرده باشد.",
    };
  }
}

export function formatDateFa(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
