import {
  callGeminiJsonWithMeta,
  callGeminiTextWithMeta,
  type GeminiFailure,
} from "@/lib/ai/gemini";
import { detectCoverTheme } from "@/lib/seo/cover-image";

function inferCoverKeywordsFromText(text: string): string[] {
  const theme = detectCoverTheme({
    categorySlug: "ai",
    title: text,
    excerpt: text,
  });
  const fallbacks: Record<string, string[]> = {
    health: ["hospital doctor", "medical checkup", "rural clinic"],
    movies: ["cinema screen", "film camera", "movie theatre"],
    sports: ["cricket stadium", "sports action", "team celebration"],
    finance: ["stock charts", "money planning", "investment growth"],
    travel: ["mountain landscape", "travel backpack", "scenic road"],
    career: ["office teamwork", "professional meeting", "laptop workspace"],
    business: ["startup office", "business handshake", "team planning"],
    code: ["programming laptop", "developer desk", "code on screen"],
    data: ["neural network", "ai technology", "data visualization"],
    cloud: ["cloud servers", "data center", "network cables"],
    food: ["indian food plate", "kitchen cooking", "restaurant table"],
    fitness: ["gym workout", "yoga mat", "running outdoors"],
    gaming: ["gaming controller", "esports arena", "video game"],
    education: ["students classroom", "books study", "online learning"],
    fashion: ["fashion outfit", "clothing rack", "style portrait"],
    lifestyle: ["morning coffee", "city lifestyle", "home workspace"],
    marketing: ["digital marketing", "analytics dashboard", "social media"],
    science: ["science lab", "microscope research", "chemistry glass"],
    robotics: ["robot arm", "automation factory", "tech innovation"],
  };
  return fallbacks[theme ?? "data"] ?? ["technology abstract", "modern workspace", "digital india"];
}

function normalizeArticle(raw: Partial<GeneratedArticle>): GeneratedArticle | null {
  if (
    !raw.title ||
    !raw.excerpt ||
    !raw.metaDescription ||
    !Array.isArray(raw.tags) ||
    !raw.content
  ) {
    return null;
  }
  const coverKeywords = Array.isArray(raw.coverKeywords)
    ? raw.coverKeywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 6)
    : [];
  const text = `${raw.title} ${raw.excerpt} ${raw.tags.join(" ")}`;
  return {
    title: String(raw.title).trim(),
    excerpt: String(raw.excerpt).trim(),
    metaDescription: String(raw.metaDescription).trim(),
    metaKeywords: raw.metaKeywords ? String(raw.metaKeywords).trim() : undefined,
    tags: raw.tags.map((t) => String(t).trim()).filter(Boolean),
    coverKeywords:
      coverKeywords.length > 0 ? coverKeywords : inferCoverKeywordsFromText(text),
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
    content: { type: "string" },
  },
  required: ["title", "excerpt", "metaDescription", "tags", "coverKeywords", "content"],
};

export type GeneratedArticle = {
  title: string;
  excerpt: string;
  metaDescription: string;
  metaKeywords?: string;
  tags: string[];
  coverKeywords: string[];
  content: string;
};

export const ARTICLE_TARGET_WORDS = { min: 550, max: 850 } as const;

export type GenerateArticleResult = {
  article: GeneratedArticle | null;
  failure?: GeminiFailure;
  reason?: "quota" | "generation" | "short";
};

function parseArticleJson(text: string): GeneratedArticle | null {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned) as Partial<GeneratedArticle>;
    return normalizeArticle(parsed);
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
- coverKeywords: exactly 4 short visual phrases (2-4 words each) for a stock photo that fits this article — concrete nouns/scenes, not abstract (e.g. "rural clinic stethoscope", "stock market chart", "bollywood film reel")`;

  const user = input.expandFrom
    ? `Expand this article into a readable blog post (${input.minWords}–${input.maxWords} words). Keep the topic, add depth but stay concise — no fluff.

Current title: ${input.title}
Category: ${input.category}
Search intent: ${input.searchIntent}

Existing draft:
${input.expandFrom.slice(0, 6000)}

Return JSON with title, excerpt (2 sentences), metaDescription (150-160 chars), metaKeywords (comma-separated), tags (5-7), coverKeywords (4 visual photo phrases), and content (full Markdown body).`
    : `Write a complete blog article for:
Title idea: ${input.title}
Category: ${input.category}
Search intent: ${input.searchIntent}

Return JSON with title, excerpt (2 sentences), metaDescription (150-160 chars), metaKeywords (comma-separated), tags (4-6), coverKeywords (4 visual photo phrases), and content (full Markdown body).`;

  return { system, user };
}

export async function generateSeoArticle(input: {
  title: string;
  category: string;
  searchIntent: string;
  affiliateNote?: string;
  minWords?: number;
  maxWords?: number;
  expandFrom?: string;
}): Promise<GenerateArticleResult> {
  const minWords = input.minWords ?? ARTICLE_TARGET_WORDS.min;
  const maxWords = input.maxWords ?? ARTICLE_TARGET_WORDS.max;
  const { system, user } = buildPrompts({ ...input, minWords, maxWords });

  const jsonResult = await callGeminiJsonWithMeta<GeneratedArticle>(
    system,
    user,
    ARTICLE_JSON_SCHEMA,
    8192
  );

  if (jsonResult.ok && jsonResult.data.content?.length >= 400) {
    const article = normalizeArticle(jsonResult.data);
    if (article) return { article };
  }

  const textResult = await callGeminiTextWithMeta(
    system,
    `${user}

Return ONLY valid JSON (no markdown fences) with keys: title, excerpt, metaDescription, metaKeywords, tags (string array), coverKeywords (string array, 4 visual phrases), content (markdown body).`,
    8192
  );

  if (textResult.ok) {
    const parsed = parseArticleJson(textResult.text);
    if (parsed?.content && parsed.content.length >= 400) {
      return { article: parsed };
    }
  }

  const failure = !jsonResult.ok
    ? jsonResult.failure
    : !textResult.ok
      ? textResult.failure
      : undefined;

  const partial = jsonResult.ok ? jsonResult.data : parseArticleJson(textResult.ok ? textResult.text : "");

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
