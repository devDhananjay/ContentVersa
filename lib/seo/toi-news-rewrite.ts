/**
 * Multi-provider TOI rewrite: Gemini → OpenAI → Groq → local light paraphrase.
 * Goal: keep the SAME actual news (facts, quotes, places) — only reword lightly.
 */

import {
  callGeminiJsonWithMeta,
  getGeminiBlogApiKey,
  isGeminiBlogConfigured,
  type GeminiFailure,
} from "@/lib/ai/gemini";
import { CATEGORIES } from "@/lib/data/categories";
import type { ToiRssItem } from "@/lib/seo/toi-rss";

export type RewriteArticle = {
  title: string;
  excerpt: string;
  content: string;
  metaDescription: string;
  tags: string[];
  provider: "gemini" | "openai" | "groq" | "local";
};

export type RewriteResult =
  | { ok: true; article: RewriteArticle }
  | { ok: false; failure?: GeminiFailure; tried: string[] };

const REWRITE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    content: { type: "string" },
    metaDescription: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
  },
  required: ["title", "excerpt", "content", "metaDescription", "tags"],
};

const SYSTEM_PROMPT = [
  "You are a news rewrite desk for ContentVerse India.",
  "You receive the ACTUAL news article text from a public source.",
  "Your job: LIGHTLY REWRITE it — same news, same facts, same quotes, same places and numbers.",
  "Change sentence structure and some keywords/phrasing so it is not a verbatim copy.",
  "KEEP speaker quotes accurate (you may only fix punctuation). Do NOT invent new quotes or facts.",
  "Do NOT add editorial sections like 'what to watch', 'why this matters', or invented background.",
  "Output Markdown: short news paragraphs. If the source lists top quotes, put them under ## Key quotes as bullets.",
  "Open with a dateline when present (e.g. NEW DELHI: …).",
  "Title: lightly polish the original headline (same meaning).",
  "Never claim you are Times of India.",
].join(" ");

/** Detect old filler template so we can refresh published posts. */
export function isFillerNewsBriefing(content: string): boolean {
  const c = content.toLowerCase();
  return (
    c.includes("what is confirmed so far") ||
    c.includes("why this matters in india") ||
    c.includes("context without the noise") ||
    c.includes("how to read the next updates") ||
    c.includes("contentverse india is treating") ||
    c.includes("original contentverse india briefing built from a public headline") ||
    c.includes("the address lands in a news cycle where festival messaging")
  );
}

function sourceText(item: ToiRssItem): string {
  const body = (item.articleBody || "").trim();
  if (body.length >= 180) return body;
  const desc = (item.description || "").trim();
  if (desc.length >= 80) return desc;
  return item.title;
}

function buildUserPrompt(item: ToiRssItem, categorySlug: string): string {
  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  const source = sourceText(item);
  return [
    `Category desk: ${cat?.name ?? categorySlug}`,
    `Original headline: ${item.title}`,
    item.publishedAt ? `Date: ${item.publishedAt}` : "",
    "",
    "ACTUAL NEWS TEXT (lightly rewrite — keep all facts and quotes):",
    source.slice(0, 10000),
    "",
    "Return JSON: title, excerpt (~160 chars), content (markdown rewrite of THIS news), metaDescription, tags (3–5).",
  ]
    .filter(Boolean)
    .join("\n");
}

function finalizeArticle(
  data: Omit<RewriteArticle, "provider">,
  provider: RewriteArticle["provider"]
): RewriteArticle {
  return {
    ...data,
    content: dedupeBriefingParagraphs(data.content.trim()),
    provider,
  };
}

function normalizeAiJson(
  raw: Partial<RewriteArticle>,
  item: ToiRssItem,
  provider: RewriteArticle["provider"]
): RewriteArticle | null {
  if (!raw.title || !raw.content) return null;
  const content = String(raw.content).trim();
  if (isFillerNewsBriefing(content) && provider !== "local") return null;
  // Must still look like the same story (overlap with source keywords).
  const src = sourceText(item).toLowerCase();
  const out = content.toLowerCase();
  const anchors = ["modi", "delhi", "india", "said", "minister", "government"];
  const srcHits = anchors.filter((a) => src.includes(a));
  if (srcHits.length >= 2) {
    const kept = srcHits.filter((a) => out.includes(a)).length;
    if (kept < Math.min(2, srcHits.length)) return null;
  }
  return finalizeArticle(
    {
      title: String(raw.title).trim().slice(0, 160),
      excerpt: String(raw.excerpt || raw.metaDescription || "")
        .trim()
        .slice(0, 280),
      content,
      metaDescription: String(raw.metaDescription || raw.excerpt || "")
        .trim()
        .slice(0, 160),
      tags: Array.isArray(raw.tags)
        ? raw.tags
            .map((t) => String(t).trim())
            .filter(Boolean)
            .filter((t) => !/^toi\s*rewrite$/i.test(t))
            .slice(0, 5)
        : ["India news", "ContentVerse", "Live news"],
    },
    provider
  );
}

async function rewriteWithOpenAICompatible(options: {
  apiKey: string;
  baseUrl: string;
  model: string;
  system: string;
  user: string;
}): Promise<Partial<RewriteArticle> | null> {
  const res = await fetch(`${options.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages: [
        { role: "system", content: options.system },
        {
          role: "user",
          content: `${options.user}\n\nRespond with a single JSON object only (no markdown fences).`,
        },
      ],
      max_tokens: 4096,
      temperature: 0.35,
      response_format: { type: "json_object" },
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    console.warn(
      `[toi-rewrite] ${options.baseUrl} ${res.status}`,
      (await res.text().catch(() => "")).slice(0, 200)
    );
    return null;
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) return null;
  try {
    return JSON.parse(text) as Partial<RewriteArticle>;
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]) as Partial<RewriteArticle>;
    } catch {
      return null;
    }
  }
}

/** Strip accidental repeated / filler paragraphs from local/AI briefings. */
export function dedupeBriefingParagraphs(content: string): string {
  const parts = content.split(/\n\n+/);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    let trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed === "---" || trimmed === "***" || trimmed === "* * *") continue;
    const key = trimmed.toLowerCase().replace(/\s+/g, " ");
    if (key.startsWith("readers who want depth should cross-check")) continue;
    if (
      key.includes("primary reporting") &&
      (key.includes("times of india") || key.includes("toi"))
    ) {
      continue;
    }
    if (
      /\*?contentverse india original briefing\.?\s*primary reporting:?/i.test(
        trimmed
      )
    ) {
      continue;
    }
    trimmed = trimmed
      .replace(
        /\n?\*?ContentVerse India original briefing\.\s*Primary reporting:\s*\[[^\]]*\]\([^)]*\)\.?\*?/gi,
        ""
      )
      .replace(
        /\n?\*?ContentVerse India original briefing\.\s*Primary reporting:\s*Times of India\.?\*?/gi,
        ""
      )
      .trim();
    if (!trimmed) continue;
    const key2 = trimmed.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key2)) continue;
    seen.add(key2);
    out.push(trimmed);
  }
  return out.join("\n\n");
}

function lightSwap(text: string): string {
  return text
    .replace(/\bhighlighted the importance of\b/gi, "underscored")
    .replace(/\bemphasized the need for\b/gi, "stressed the need for")
    .replace(/\bcalled for\b/gi, "appealed for")
    .replace(/\bstressed that\b/gi, "underlined that")
    .replace(/\balso spoke about\b/gi, "also spoke of")
    .replace(/\bwhile addressing\b/gi, "as he addressed")
    .replace(/\bparticipating in\b/gi, "taking part in")
    .replace(/\bmust remain a priority\b/gi, "must stay a priority")
    .replace(/\bsymbolised\b/gi, "symbolized")
    .replace(/\bsignifies\b/gi, "means")
    .replace(/\bafforded equal opportunities\b/gi, "given equal opportunities")
    .replace(/\bGet the latest India News.*$/gi, "")
    .replace(/\bDownload the TOI app\.?/gi, "")
    .trim();
}

function splitIntoNewsBlocks(source: string): {
  narrative: string[];
  quotes: string[];
} {
  const text = source.replace(/\s+/g, " ").trim();
  // Split before "Here are the top quotes..."
  const quoteSplit = text.split(
    /Here are the top quotes from[^:]*:\s*/i
  );
  const narrativePart = quoteSplit[0] || text;
  const quotePart = quoteSplit[1] || "";

  const narrative = narrativePart
    .split(/(?<=[.!?])\s+(?=[A-Z“"])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const quotes: string[] = [];
  if (quotePart) {
    // TOI JSON-LD runs quote bullets together — split into sentences as bullets.
    const chunks = quotePart
      .split(/(?<=[.!?…])\s+/)
      .map((s) => s.trim().replace(/\.\.\.$/, "…"))
      .filter((s) => s.length > 28 && !/^get the latest/i.test(s));
    for (const c of chunks) {
      quotes.push(c);
    }
  }

  // Also pull explicit quoted strings from narrative
  const re = /[“"]([^”"]{20,280})[”"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(narrativePart)) !== null) {
    const q = m[1]!.trim();
    if (!quotes.some((x) => x.includes(q.slice(0, 40)))) quotes.push(q);
  }

  return { narrative, quotes: quotes.slice(0, 14) };
}

/**
 * Local light rewrite of the ACTUAL article text — same news, reworded.
 */
export function rewriteLocally(
  item: ToiRssItem,
  categorySlug: string
): RewriteArticle {
  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  const catName = cat?.name ?? "India";
  const source = sourceText(item);
  const { narrative, quotes } = splitIntoNewsBlocks(source);

  const paras: string[] = [];
  const rewrittenNarrative = narrative.map((s) => lightSwap(s));

  // Group into paragraphs of 1–2 sentences (news feel).
  for (let i = 0; i < rewrittenNarrative.length; i += 2) {
    const chunk = rewrittenNarrative.slice(i, i + 2).join(" ");
    if (chunk) paras.push(chunk);
  }

  if (!paras.length) {
    paras.push(lightSwap(source.slice(0, 900)));
  }

  if (quotes.length) {
    paras.push("## Key quotes");
    for (const q of quotes) {
      const cleaned = lightSwap(q).replace(/^["“]|["”]$/g, "");
      paras.push(`- “${cleaned}”`);
    }
  }

  const content = dedupeBriefingParagraphs(paras.join("\n\n"));
  const title =
    item.title.length > 110
      ? `${item.title.slice(0, 106).replace(/\s+\S*$/, "")}…`
      : item.title;
  const excerpt = lightSwap(narrative[0] || source).slice(0, 160);

  return finalizeArticle(
    {
      title: title.slice(0, 160),
      excerpt,
      content,
      metaDescription: excerpt.slice(0, 160),
      tags: ["India news", "ContentVerse", "Live news", catName]
        .filter(Boolean)
        .slice(0, 5),
    },
    "local"
  );
}

/** Once Gemini free-tier dies mid-run, skip it for remaining headlines. */
let skipGeminiForProcess = false;

export function resetToiRewriteProviderState() {
  skipGeminiForProcess = false;
}

/**
 * Try Gemini, then OpenAI, then Groq, then local light paraphrase.
 */
export async function rewriteToiHeadline(
  item: ToiRssItem,
  categorySlug: string
): Promise<RewriteResult> {
  const system = SYSTEM_PROMPT;
  const user = buildUserPrompt(item, categorySlug);
  const tried: string[] = [];
  const forceSkipGemini =
    skipGeminiForProcess ||
    process.env.TOI_NEWS_SKIP_GEMINI === "1" ||
    process.env.TOI_NEWS_SKIP_GEMINI === "true";

  if (isGeminiBlogConfigured() && !forceSkipGemini) {
    tried.push("gemini");
    const result = await callGeminiJsonWithMeta<Partial<RewriteArticle>>(
      system,
      user,
      REWRITE_SCHEMA,
      8192,
      { apiKey: getGeminiBlogApiKey() || undefined }
    );
    if (result.ok) {
      const article = normalizeAiJson(result.data, item, "gemini");
      if (article) return { ok: true, article };
    } else if (result.failure?.quotaExceeded) {
      skipGeminiForProcess = true;
      console.warn("[toi-rewrite] Gemini quota — falling back for rest of run");
    }
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    tried.push("openai");
    const raw = await rewriteWithOpenAICompatible({
      apiKey: openaiKey,
      baseUrl: "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      system,
      user,
    });
    const article = raw ? normalizeAiJson(raw, item, "openai") : null;
    if (article) return { ok: true, article };
  }

  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    tried.push("groq");
    const raw = await rewriteWithOpenAICompatible({
      apiKey: groqKey,
      baseUrl: "https://api.groq.com/openai/v1",
      model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
      system,
      user,
    });
    const article = raw ? normalizeAiJson(raw, item, "groq") : null;
    if (article) return { ok: true, article };
  }

  tried.push("local");
  return { ok: true, article: rewriteLocally(item, categorySlug) };
}
