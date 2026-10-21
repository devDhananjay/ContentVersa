/**
 * Fetch Times of India article page and extract the real news body (JSON-LD articleBody).
 * Used so Live News keeps the same facts/quotes — then we lightly rewrite wording.
 */

import { cleanToiImageUrl } from "@/lib/seo/toi-cover-url";

const FETCH_TIMEOUT_MS = 18_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; ContentVerseIndiaBot/1.0; +https://contentverse.co.in; news-rewrite)";

export type ToiArticleExtract = {
  headline?: string;
  description?: string;
  /** Clean plain-text news body from TOI JSON-LD */
  articleBody: string;
  imageUrl?: string;
  datePublished?: string;
};

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(text: string): string {
  return decodeHtml(text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function cleanArticleBody(raw: string): string {
  let t = stripHtml(raw);
  // TOI often concatenates sentences without spaces after periods.
  t = t.replace(/([a-z.])([A-Z])/g, "$1 $2");
  t = t.replace(/\s+/g, " ").trim();
  // Drop TOI app promo / boilerplate footers.
  t = t
    .replace(/Get the latest India News and Live updates\.?\s*Download the TOI app\.?/gi, "")
    .replace(/Download the TOI app\.?/gi, "")
    .replace(/Tired of too many ads\?.*?$/gi, "")
    .trim();
  return t;
}

function parseNewsArticleLd(html: string): ToiArticleExtract | null {
  const blocks = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  if (!blocks) return null;

  for (const block of blocks) {
    const jsonText = block.replace(/<\/?script[^>]*>/gi, "").trim();
    try {
      const data = JSON.parse(jsonText) as unknown;
      const nodes = Array.isArray(data) ? data : [data];
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const n = node as Record<string, unknown>;
        const type = String(n["@type"] || "");
        if (!/NewsArticle/i.test(type)) continue;
        const bodyRaw = typeof n.articleBody === "string" ? n.articleBody : "";
        const body = cleanArticleBody(bodyRaw);
        if (body.length < 180) continue;

        const image =
          typeof n.thumbnailUrl === "string"
            ? n.thumbnailUrl
            : typeof n.image === "string"
              ? n.image
              : Array.isArray(n.image) && typeof n.image[0] === "string"
                ? n.image[0]
                : undefined;

        return {
          headline: typeof n.headline === "string" ? stripHtml(n.headline) : undefined,
          description:
            typeof n.description === "string"
              ? stripHtml(n.description).slice(0, 400)
              : undefined,
          articleBody: body.slice(0, 12000),
          imageUrl: image?.startsWith("http")
            ? cleanToiImageUrl(image) || image
            : undefined,
          datePublished:
            typeof n.datePublished === "string" ? n.datePublished : undefined,
        };
      }
    } catch {
      // ignore malformed JSON-LD
    }
  }
  return null;
}

function extractMeta(html: string, key: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
      "i"
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1].trim());
  }
  return null;
}

/** Fetch TOI article URL and return the real news text (prefer JSON-LD articleBody). */
export async function fetchToiArticleText(
  url: string
): Promise<ToiArticleExtract | null> {
  if (!url.startsWith("http") || !/indiatimes\.com/i.test(url)) return null;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-IN,en;q=0.9",
      },
      redirect: "follow",
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[toi-article] HTTP ${res.status} for ${url}`);
      return null;
    }
    const html = (await res.text()).slice(0, 500_000);
    const fromLd = parseNewsArticleLd(html);
    if (fromLd) return fromLd;

    const og = extractMeta(html, "og:description");
    if (og && og.length >= 120) {
      return {
        description: og,
        articleBody: cleanArticleBody(og),
        imageUrl: (() => {
          const img = extractMeta(html, "og:image");
          return img ? cleanToiImageUrl(img) || img : undefined;
        })(),
        headline: extractMeta(html, "og:title") || undefined,
      };
    }
    return null;
  } catch (err) {
    console.warn("[toi-article] fetch failed:", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
