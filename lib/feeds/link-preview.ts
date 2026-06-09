import { cache } from "@/lib/redis";

export interface LinkPreview {
  image?: string;
  description?: string;
  title?: string;
}

const PREVIEW_TTL = 3600;
const FETCH_TIMEOUT_MS = 5000;

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(text: string): string {
  return decodeHtml(text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
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

function extractJsonLdDescription(html: string): string | null {
  const blocks = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  if (!blocks) return null;

  for (const block of blocks) {
    const jsonText = block.replace(/<\/?script[^>]*>/gi, "").trim();
    try {
      const data = JSON.parse(jsonText) as
        | { description?: string; articleBody?: string }
        | { description?: string; articleBody?: string }[];
      const nodes = Array.isArray(data) ? data : [data];
      for (const node of nodes) {
        if (node.articleBody) return stripHtml(node.articleBody).slice(0, 4000);
        if (node.description) return stripHtml(node.description).slice(0, 2000);
      }
    } catch {
      // ignore malformed JSON-LD
    }
  }
  return null;
}

function parsePreviewFromHtml(html: string): LinkPreview {
  const image =
    extractMeta(html, "og:image") ||
    extractMeta(html, "twitter:image") ||
    extractMeta(html, "twitter:image:src") ||
    undefined;

  const description =
    extractJsonLdDescription(html) ||
    extractMeta(html, "og:description") ||
    extractMeta(html, "twitter:description") ||
    extractMeta(html, "description") ||
    undefined;

  const title =
    extractMeta(html, "og:title") || extractMeta(html, "twitter:title") || undefined;

  return {
    image: image?.startsWith("http") ? image : undefined,
    description: description ? stripHtml(description) : undefined,
    title: title ? stripHtml(title) : undefined,
  };
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  if (!url.startsWith("http")) return null;

  const cacheKey = `feeds:preview:${url}`;
  const cached = await cache.get<LinkPreview>(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ContentVerse/1.0; +https://contentverse.co.in)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      next: { revalidate: PREVIEW_TTL },
    });
    clearTimeout(timer);

    if (!res.ok) return null;

    const html = await res.text();
    const preview = parsePreviewFromHtml(html.slice(0, 250_000));
    if (!preview.image && !preview.description && !preview.title) return null;

    await cache.set(cacheKey, preview, PREVIEW_TTL);
    return preview;
  } catch {
    return null;
  }
}

export { stripHtml };
