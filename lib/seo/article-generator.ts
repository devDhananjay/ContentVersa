import { callGeminiJson } from "@/lib/ai/gemini";

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

export async function generateSeoArticle(input: {
  title: string;
  category: string;
  searchIntent: string;
  affiliateNote?: string;
  minWords?: number;
  maxWords?: number;
  expandFrom?: string;
}): Promise<GeneratedArticle | null> {
  const minWords = input.minWords ?? ARTICLE_TARGET_WORDS.min;
  const maxWords = input.maxWords ?? ARTICLE_TARGET_WORDS.max;

  const system = `You are an expert content writer for ContentVerse (contentverse.co.in), an Indian creator platform.
Write original, engaging articles in Markdown — concise and scannable, NOT long essays.
Rules:
- Target ${minWords}–${maxWords} words in "content" (about 3–5 min read). Never exceed ${maxWords} words.
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
    ? `Expand this article into a readable blog post (${minWords}–${maxWords} words). Keep the topic, add depth but stay concise — no fluff.

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

  return callGeminiJson<GeneratedArticle>(
    system,
    user,
    ARTICLE_JSON_SCHEMA,
    8192
  );
}
