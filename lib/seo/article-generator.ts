import {
  callGeminiJsonWithMeta,
  callGeminiTextWithMeta,
  type GeminiFailure,
} from "@/lib/ai/gemini";

export const ARTICLE_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    metaDescription: { type: "string" },
    metaKeywords: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    content: { type: "string" },
  },
  required: ["title", "excerpt", "metaDescription", "tags", "content"],
};

export type GeneratedArticle = {
  title: string;
  excerpt: string;
  metaDescription: string;
  metaKeywords?: string;
  tags: string[];
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
    if (
      !parsed.title ||
      !parsed.excerpt ||
      !parsed.metaDescription ||
      !Array.isArray(parsed.tags) ||
      !parsed.content
    ) {
      return null;
    }
    return {
      title: String(parsed.title).trim(),
      excerpt: String(parsed.excerpt).trim(),
      metaDescription: String(parsed.metaDescription).trim(),
      metaKeywords: parsed.metaKeywords
        ? String(parsed.metaKeywords).trim()
        : undefined,
      tags: parsed.tags.map((t) => String(t).trim()).filter(Boolean),
      content: String(parsed.content).trim(),
    };
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
- Do NOT invent fake statistics; use ranges and general guidance when exact data unknown`;

  const user = input.expandFrom
    ? `Expand this article into a readable blog post (${input.minWords}–${input.maxWords} words). Keep the topic, add depth but stay concise — no fluff.

Current title: ${input.title}
Category: ${input.category}
Search intent: ${input.searchIntent}

Existing draft:
${input.expandFrom.slice(0, 6000)}

Return JSON with title, excerpt (2 sentences), metaDescription (150-160 chars), metaKeywords (comma-separated), tags (5-7), and content (full Markdown body).`
    : `Write a complete blog article for:
Title idea: ${input.title}
Category: ${input.category}
Search intent: ${input.searchIntent}

Return JSON with title, excerpt (2 sentences), metaDescription (150-160 chars), metaKeywords (comma-separated), tags (4-6), and content (full Markdown body).`;

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
    return { article: jsonResult.data };
  }

  const textResult = await callGeminiTextWithMeta(
    system,
    `${user}

Return ONLY valid JSON (no markdown fences) with keys: title, excerpt, metaDescription, metaKeywords, tags (string array), content (markdown body).`,
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
