/**
 * Multi-provider TOI rewrite: Gemini → OpenAI → Groq → local editorial expand.
 * Keeps the cron alive when Gemini free-tier quota is exhausted.
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
  "You are a senior India news editor for ContentVerse India.",
  "Write an ORIGINAL briefing from the headline and short RSS blurb only.",
  "Do NOT copy sentences from the blurb. Paraphrase and add context for Indian readers.",
  "Use Markdown with ## headings and short paragraphs. Do not repeat the title as a # heading.",
  "Target 650–900 words. Neutral, factual tone. No invented quotes or fake statistics.",
  "If details are unknown from the blurb, say what is confirmed vs what to watch next.",
  "End with a short 'What to watch next' section — do not invent timelines.",
  "Never claim you are Times of India; this is ContentVerse original analysis.",
].join(" ");

function buildUserPrompt(item: ToiRssItem, categorySlug: string): string {
  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  return [
    `Category: ${cat?.name ?? categorySlug}`,
    `Headline: ${item.title}`,
    `RSS blurb: ${item.description || "(none — write careful context-only briefing)"}`,
    `Source link (cite only as primary reporting, do not scrape): ${item.link}`,
    `Feed: ${item.feedKey}`,
    item.publishedAt ? `RSS pubDate: ${item.publishedAt}` : "",
    "",
    "Return JSON: title (original), excerpt (~160 chars), content (markdown body), metaDescription, tags (3–5 strings).",
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
  return finalizeArticle(
    {
      title: String(raw.title).trim().slice(0, 160),
      excerpt: String(raw.excerpt || raw.metaDescription || "")
        .trim()
        .slice(0, 280),
      content: String(raw.content).trim(),
      metaDescription: String(raw.metaDescription || raw.excerpt || "")
        .trim()
        .slice(0, 160),
      tags: Array.isArray(raw.tags)
        ? raw.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 5)
        : ["India news"],
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
      temperature: 0.55,
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
    // Drop horizontal rule + TOI source footer (no longer shown on site).
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
    // Strip trailing italic TOI attribution line if mixed into a block.
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

/** Deterministic original expand when all AI keys/quota fail — no repeated filler. */
function rewriteLocally(
  item: ToiRssItem,
  categorySlug: string
): RewriteArticle {
  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  const catName = cat?.name ?? "India";
  const blurb = (item.description || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 420);
  const title =
    item.title.length > 90
      ? `${item.title.slice(0, 86).replace(/\s+\S*$/, "")}…`
      : item.title;
  const shortTitle = title.length > 70 ? `${title.slice(0, 67)}…` : title;
  const angle = blurb
    ? `Early reporting points to this: ${blurb}`
    : `Public reporting is still thin on detail, so this briefing sticks to what the headline establishes and what Indian readers should watch next.`;

  const content = dedupeBriefingParagraphs(
    [
      `## What is confirmed so far`,
      angle,
      `ContentVerse India is treating “${shortTitle}” as a developing ${catName.toLowerCase()} story. We are not inventing behind-the-scenes claims, quotes, or numbers that are not in the public headline brief.`,
      `## Why this matters in India`,
      `Headlines in this lane travel fast across TV crawls, WhatsApp forwards, and social feeds. A calm read helps separate the core development from speculation. For people following ${catName}, the practical question is whether anything here changes policy, markets, public services, sport calendars, or day-to-day decisions in the next few days.`,
      `## Context without the noise`,
      `India’s news cycle often compresses complex processes into one sharp line. That helps awareness, but it can flatten trade-offs. When a major desk pushes a story, readers benefit from a slower pass: what is the concrete event, who is named, what remains unresolved, and what should be verified before sharing.`,
      `Prefer later official statements, court filings, company filings, or on-record briefings over viral wording alone.`,
      `## How to read the next updates`,
      `If the story widens, look for three signals: a clearer timeline, a named decision-maker or institution, and a document or broadcast that can be checked independently. Until then, treat secondary commentary as opinion around the headline — not as settled fact.`,
      `## What to watch next`,
      `- Official clarification that confirms, narrows, or walks back the early framing`,
      `- Follow-on reporting with documents, timelines, or named sources`,
      `- Whether related institutions respond with action, not only commentary`,
      `## Bottom line`,
      `This is an original ContentVerse India briefing built from a public headline brief — not wire copy. Stay aware, wait for primary documents before hard conclusions, and come back to the Live News desk for the next rewrite when more is confirmed.`,
    ].join("\n\n")
  );

  const excerpt = blurb
    ? blurb.slice(0, 160)
    : `ContentVerse India briefing on: ${title}`.slice(0, 160);

  return finalizeArticle(
    {
      title: title.slice(0, 160),
      excerpt,
      content,
      metaDescription: excerpt.slice(0, 160),
      tags: ["India news", catName, "Live briefing"].slice(0, 5),
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
 * Try Gemini, then OpenAI, then Groq, then local expand.
 * Local always succeeds so cron can publish original briefings even on quota days.
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
