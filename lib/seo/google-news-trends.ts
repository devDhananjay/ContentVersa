/**
 * Fetch today's trending headlines from Google News RSS (India).
 * Free — no API key. Used by the nightly daily-articles cron.
 */

export type GoogleNewsHeadline = {
  title: string;
  source?: string;
  publishedAt?: string;
  link?: string;
};

const CATEGORY_NEWS_QUERIES: Record<string, string> = {
  technology: "technology India OR tech news India",
  ai: "artificial intelligence India OR AI India OR ChatGPT OR Gemini AI",
  programming: "software engineering OR coding OR developer India OR programming",
  business: "business India OR corporate India OR economy India",
  finance: "stock market India OR Sensex OR Nifty OR personal finance India",
  startups: "startup India OR funding India OR unicorn India",
  health: "health India OR wellness OR medical news India",
  fitness: "fitness India OR workout OR gym OR sports training",
  gaming: "gaming India OR esports India OR video games",
  movies: "Bollywood OR OTT India OR Indian cinema OR Netflix India",
  travel: "travel India OR tourism India OR destinations India",
  lifestyle: "lifestyle India OR habits OR living India",
  fashion: "fashion India OR streetwear India OR style trends",
  productivity: "productivity OR remote work OR work habits India",
  education: "education India OR exams India OR EdTech OR UPSC OR NEET",
  marketing: "marketing India OR digital marketing OR brand India",
  sports: "cricket India OR IPL OR Indian sports OR football India",
  relationships: "relationships OR dating India OR marriage India",
  psychology: "psychology OR mental health India OR behaviour",
  career: "jobs India OR career India OR hiring OR salary India",
  "memes-culture": "viral India OR internet culture OR memes OR trending India",
};

const FETCH_TIMEOUT_MS = 12_000;
const MAX_HEADLINES = 8;

function decodeXmlEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function stripSourceSuffix(rawTitle: string): { title: string; source?: string } {
  const cleaned = decodeXmlEntities(rawTitle).replace(/\s+/g, " ").trim();
  // Google News titles often end with " - Source Name"
  const dash = cleaned.lastIndexOf(" - ");
  if (dash > 20) {
    return {
      title: cleaned.slice(0, dash).trim(),
      source: cleaned.slice(dash + 3).trim() || undefined,
    };
  }
  return { title: cleaned };
}

function extractTag(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  if (!m?.[1]) return undefined;
  return decodeXmlEntities(m[1].replace(/<[^>]+>/g, "")).trim() || undefined;
}

function parseRssItems(xml: string): GoogleNewsHeadline[] {
  const items: GoogleNewsHeadline[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1];
    const rawTitle = extractTag(block, "title");
    if (!rawTitle) continue;
    const { title, source } = stripSourceSuffix(rawTitle);
    if (title.length < 12) continue;
    items.push({
      title: title.slice(0, 180),
      source: source || extractTag(block, "source"),
      publishedAt: extractTag(block, "pubDate"),
      link: extractTag(block, "link"),
    });
    if (items.length >= MAX_HEADLINES) break;
  }
  return items;
}

function newsQueryForCategory(categorySlug: string): string {
  return (
    CATEGORY_NEWS_QUERIES[categorySlug] ??
    `${categorySlug.replace(/-/g, " ")} India`
  );
}

function googleNewsRssUrl(query: string): string {
  const params = new URLSearchParams({
    q: query,
    hl: "en-IN",
    gl: "IN",
    ceid: "IN:en",
  });
  return `https://news.google.com/rss/search?${params.toString()}`;
}

/** Fetch top Google News headlines for a ContentVerse category (India). */
export async function fetchGoogleNewsHeadlines(
  categorySlug: string
): Promise<GoogleNewsHeadline[]> {
  const query = newsQueryForCategory(categorySlug);
  const url = googleNewsRssUrl(query);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "ContentVerseDailyBot/1.0 (+https://contentverse.co.in; editorial)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(
        `[google-news] ${categorySlug}: HTTP ${res.status} for query="${query}"`
      );
      return [];
    }
    const xml = await res.text();
    const headlines = parseRssItems(xml);
    if (!headlines.length) {
      console.warn(`[google-news] ${categorySlug}: no items parsed`);
    }
    return headlines;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[google-news] ${categorySlug}: ${msg}`);
    return [];
  } finally {
    clearTimeout(timer);
  }
}
