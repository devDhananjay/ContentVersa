import {
  callGeminiJsonWithMeta,
  callGeminiTextWithMeta,
  type GeminiFailure,
} from "@/lib/ai/gemini";
import { detectCoverTheme } from "@/lib/seo/cover-image";

function inferCoverKeywordsFromText(
  title: string,
  excerpt: string,
  tags: string[],
  categorySlug: string
): string[] {
  const theme = detectCoverTheme({
    categorySlug,
    title,
    excerpt,
    tags,
  });
  const fallbacks: Record<string, string[]> = {
    health: ["hospital doctor consultation", "medical checkup room", "rural health clinic"],
    movies: ["cinema theatre screen", "film production camera", "movie premiere crowd"],
    sports: ["cricket batsman stadium night", "football goal celebration pitch", "sports trophy ceremony"],
    finance: ["stock market charts screen", "rupee investment planning", "financial growth graph"],
    travel: ["indian mountain landscape", "traveler scenic viewpoint", "heritage monument tourism"],
    career: ["professional office meeting", "job interview handshake", "laptop career workspace"],
    business: ["startup team whiteboard", "business strategy meeting", "entrepreneur office"],
    code: ["developer laptop code screen", "programming desk setup", "software engineering workspace"],
    data: ["ai neural network visualization", "machine learning dashboard", "data science charts"],
    cloud: ["cloud server data center", "network infrastructure racks", "devops monitoring screen"],
    food: ["indian thali food spread", "restaurant kitchen cooking", "street food stall"],
    fitness: ["gym weight training", "yoga session studio", "outdoor running track"],
    gaming: ["gaming controller esports", "video game tournament stage", "pc gaming rgb setup"],
    education: ["students classroom india", "exam preparation books", "online learning laptop"],
    fashion: ["indian ethnic fashion outfit", "clothing boutique display", "fashion photoshoot studio"],
    lifestyle: ["morning coffee workspace", "urban lifestyle balcony", "home decor living room"],
    marketing: ["digital marketing analytics", "social media strategy desk", "seo dashboard laptop"],
    science: ["science laboratory research", "microscope sample study", "research scientist experiment"],
    robotics: ["robotic arm factory", "automation assembly line", "engineering innovation lab"],
  };
  const base = fallbacks[theme ?? ""] ?? fallbacks[categorySlug] ?? ["editorial photo", "topic-specific scene", "professional photography"];
  const titleWords = title
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 4)
    .join(" ");
  if (titleWords) {
    return [`${titleWords} photorealistic scene`, ...base].slice(0, 4);
  }
  return base.slice(0, 4);
}

function buildCoverImagePromptFallback(
  title: string,
  excerpt: string,
  tags: string[],
  categorySlug: string,
  coverKeywords: string[]
): string {
  const primary = coverKeywords[0] || title;
  const category = categorySlug.replace(/-/g, " ");
  return `Photorealistic editorial photograph for "${title}": ${primary}. ${excerpt.slice(0, 120)} Setting and props must match ${category} and the exact topic — not generic stock imagery.`;
}

function normalizeArticle(
  raw: Partial<GeneratedArticle>,
  categorySlug = "technology"
): GeneratedArticle | null {
  if (
    !raw.title ||
    !raw.excerpt ||
    !raw.metaDescription ||
    !Array.isArray(raw.tags) ||
    !raw.content
  ) {
    return null;
  }
  const title = String(raw.title).trim();
  const excerpt = String(raw.excerpt).trim();
  const tags = raw.tags.map((t) => String(t).trim()).filter(Boolean);
  const coverKeywords = Array.isArray(raw.coverKeywords)
    ? raw.coverKeywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 6)
    : [];
  const resolvedKeywords =
    coverKeywords.length > 0
      ? coverKeywords
      : inferCoverKeywordsFromText(title, excerpt, tags, categorySlug);
  const coverImagePrompt = raw.coverImagePrompt
    ? String(raw.coverImagePrompt).trim()
    : buildCoverImagePromptFallback(title, excerpt, tags, categorySlug, resolvedKeywords);

  return {
    title,
    excerpt,
    metaDescription: String(raw.metaDescription).trim(),
    metaKeywords: raw.metaKeywords ? String(raw.metaKeywords).trim() : undefined,
    tags,
    coverKeywords: resolvedKeywords,
    coverImagePrompt,
    content: String(raw.content).trim(),
  };
}

export const ARTICLE_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    metaDescription: { type: "string" },
    metaKeywords: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    coverKeywords: { type: "array", items: { type: "string" } },
    coverImagePrompt: { type: "string" },
    content: { type: "string" },
  },
  required: ["title", "excerpt", "metaDescription", "tags", "coverKeywords", "coverImagePrompt", "content"],
};

export type GeneratedArticle = {
  title: string;
  excerpt: string;
  metaDescription: string;
  metaKeywords?: string;
  tags: string[];
  coverKeywords: string[];
  coverImagePrompt: string;
  content: string;
};

export const ARTICLE_TARGET_WORDS = { min: 550, max: 850 } as const;

export type GenerateArticleResult = {
  article: GeneratedArticle | null;
  failure?: GeminiFailure;
  reason?: "quota" | "generation" | "short";
};

function parseArticleJson(text: string, categorySlug = "technology"): GeneratedArticle | null {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned) as Partial<GeneratedArticle>;
    return normalizeArticle(parsed, categorySlug);
  } catch {
    return null;
  }
}

function buildPrompts(input: {
  title: string;
  category: string;
  searchIntent: string;
  affiliateNote?: string;
  minWords: number;
  maxWords: number;
  expandFrom?: string;
}) {
  const system = `You are an expert content writer for ContentVerse (contentverse.co.in), an Indian creator platform.
Write original, engaging articles in Markdown — concise and scannable, NOT long essays.
Rules:
- Target ${input.minWords}–${input.maxWords} words in "content" (about 3–5 min read). Never exceed ${input.maxWords} words.
- Use ## and ### headings only (no # h1 — title is separate)
- Structure: short intro (2–3 sentences), 3–4 focused sections, 2 FAQ questions, brief conclusion
- Short paragraphs (2–4 sentences max). Use bullet lists where helpful.
- Write for Indian readers where relevant (₹, Indian cities, regulations)
- Natural, conversational tone — not robotic, not keyword-stuffed
- End with one line under "## Support creators" about tipping writers on ContentVerse
${input.affiliateNote ? `- ${input.affiliateNote}` : ""}
- If finance: add disclaimer "This is educational content, not financial advice."
- Do NOT invent fake statistics; use ranges and general guidance when exact data unknown
- coverKeywords: exactly 4 short visual tags from the cover scene (sport name, objects, setting)
- coverImagePrompt: ONE detailed sentence for a photorealistic hero photo that matches THIS exact article — name the sport/topic, action, setting, and key objects. For sports: specify cricket/football/hockey etc., never a generic gym. For movies: name the film vibe. Must NOT be generic category stock art.`;

  const user = input.expandFrom
    ? `Expand this article into a readable blog post (${input.minWords}–${input.maxWords} words). Keep the topic, add depth but stay concise — no fluff.

Current title: ${input.title}
Category: ${input.category}
Search intent: ${input.searchIntent}

Existing draft:
${input.expandFrom.slice(0, 6000)}

Return JSON with title, excerpt (2 sentences), metaDescription (150-160 chars), metaKeywords (comma-separated), tags (5-7), coverKeywords (4 visual tags), coverImagePrompt (one detailed photorealistic scene sentence), and content (full Markdown body).`
    : `Write a complete blog article for:
Title idea: ${input.title}
Category: ${input.category}
Search intent: ${input.searchIntent}

Return JSON with title, excerpt (2 sentences), metaDescription (150-160 chars), metaKeywords (comma-separated), tags (4-6), coverKeywords (4 visual tags), coverImagePrompt (one detailed photorealistic scene sentence matching this exact topic), and content (full Markdown body).`;

  return { system, user };
}

export async function generateSeoArticle(input: {
  title: string;
  category: string;
  categorySlug?: string;
  searchIntent: string;
  affiliateNote?: string;
  minWords?: number;
  maxWords?: number;
  expandFrom?: string;
}): Promise<GenerateArticleResult> {
  const minWords = input.minWords ?? ARTICLE_TARGET_WORDS.min;
  const maxWords = input.maxWords ?? ARTICLE_TARGET_WORDS.max;
  const categorySlug =
    input.categorySlug?.trim() ||
    input.category.toLowerCase().replace(/\s+/g, "-");
  const { system, user } = buildPrompts({ ...input, minWords, maxWords });

  const jsonResult = await callGeminiJsonWithMeta<GeneratedArticle>(
    system,
    user,
    ARTICLE_JSON_SCHEMA,
    8192
  );

  if (jsonResult.ok && jsonResult.data.content?.length >= 400) {
    const article = normalizeArticle(jsonResult.data, categorySlug);
    if (article) return { article };
  }

  const textResult = await callGeminiTextWithMeta(
    system,
    `${user}

Return ONLY valid JSON (no markdown fences) with keys: title, excerpt, metaDescription, metaKeywords, tags (string array), coverKeywords (string array, 4 visual tags), coverImagePrompt (one detailed photorealistic scene sentence), content (markdown body).`,
    8192
  );

  if (textResult.ok) {
    const parsed = parseArticleJson(textResult.text, categorySlug);
    if (parsed?.content && parsed.content.length >= 400) {
      return { article: parsed };
    }
  }

  const failure = !jsonResult.ok
    ? jsonResult.failure
    : !textResult.ok
      ? textResult.failure
      : undefined;

  const partial = jsonResult.ok
    ? jsonResult.data
    : parseArticleJson(textResult.ok ? textResult.text : "", categorySlug);

  if (partial?.content && partial.content.length > 0) {
    return {
      article: null,
      failure,
      reason: "short",
    };
  }

  return {
    article: null,
    failure,
    reason: failure?.quotaExceeded ? "quota" : "generation",
  };
}

/** Back-compat helper for scripts that expect null on failure. */
export async function generateSeoArticleOrNull(
  input: Parameters<typeof generateSeoArticle>[0]
): Promise<GeneratedArticle | null> {
  const { article } = await generateSeoArticle(input);
  return article;
}
