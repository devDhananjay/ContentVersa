/**
 * AI writing helpers — Gemini (primary), OpenAI (fallback),
 * then smart heuristics when no API key is set.
 */

import { callGeminiText, callGeminiImage, isGeminiConfigured } from "@/lib/ai/gemini";
import {
  countWords,
  trimSummaryWords,
  trimToWordCount,
  SHORTS_SUMMARY_MIN_WORDS,
  SHORTS_SUMMARY_MAX_WORDS,
  SHORTS_SLOGAN_WORDS,
} from "@/lib/utils";
import {
  buildStructuredLocalSummary,
  finalizeArticleSummary,
  getSummaryWordTargets,
  markdownToPlainText,
} from "@/lib/ai/article-summary";

export type AiAction =
  | "summarize"
  | "article-summary"
  | "seo-title"
  | "blog-ideas"
  | "excerpt"
  | "tags"
  | "image-prompt"
  | "generate-image"
  | "expand-thesis"
  | "generate-from-title";

type AssistInput = {
  action: AiAction;
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  imagePrompt?: string;
};

export type AiSource = "gemini" | "openai" | "local";

async function callOpenAI(system: string, user: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user.slice(0, 12000) },
      ],
      max_tokens: 800,
      temperature: 0.7,
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function callAiText(
  system: string,
  user: string,
  maxTokens = 512
): Promise<{ text: string | null; source: AiSource }> {
  if (isGeminiConfigured()) {
    const gemini = await callGeminiText(system, user, maxTokens);
    if (gemini) return { text: gemini, source: "gemini" };
  }
  const openai = await callOpenAI(system, user);
  if (openai) return { text: openai, source: "openai" };
  return { text: null, source: "local" };
}

function firstSentence(text: string, max = 160) {
  const s = text.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  return s.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

function heuristicArticleSummary(title: string, content: string, _excerpt?: string) {
  return buildStructuredLocalSummary(content, title);
}

function heuristicAssist(input: AssistInput): string | string[] {
  const title = input.title?.trim() || "Your next big idea";
  const content = input.content?.trim() || "";
  const words = content.split(/\s+/).filter(Boolean);
  const cat = input.category || "technology";

  switch (input.action) {
    case "article-summary":
      if (!content && !input.excerpt) {
        return "Add article text first.";
      }
      return heuristicArticleSummary(title, content, input.excerpt);

    case "summarize":
      if (!content) return "Add some body text first, then we can summarize it.";
      return firstSentence(content, 280);

    case "seo-title": {
      const base = title.length > 55 ? firstSentence(title, 55) : title;
      const suffixes = [
        " — A Creator's Guide",
        " | What Nobody Tells You",
        " (2026 Edition)",
      ];
      return `${base}${suffixes[Math.floor(Math.random() * suffixes.length)]}`.slice(
        0,
        70
      );
    }

    case "blog-ideas":
      return [
        `Why ${cat} creators are winning in 2026`,
        `5 mistakes I made writing about ${title}`,
        `The contrarian take on ${title}`,
        `From zero to audience: a ${cat} playbook`,
        `What experts won't say about ${title}`,
      ];

    case "excerpt":
      if (content) return firstSentence(content, 200);
      return `A sharp take on ${title} — written for builders who ship in public.`;

    case "tags": {
      const fromTitle = title
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3)
        .slice(0, 3);
      return [...new Set([cat, ...fromTitle, "creators", "essay"])].slice(0, 5);
    }

    case "image-prompt":
      return `Editorial cover illustration for an article titled "${title}", ${cat} theme, modern minimalist, soft gradient lighting, no text, 16:9`;

    case "expand-thesis":
      if (!content && !title)
        return "Start with a bold claim in your title, then support it with 3 concrete examples.";
      return `Thesis: ${title}\n\n1. Hook — state the problem readers feel today.\n2. Evidence — ${words.length} words of draft; add one data point or story.\n3. Takeaway — what should the reader do in the next 24 hours?`;

    case "generate-from-title":
      return `## Introduction\n\n${title} is reshaping how creators and readers think about ${cat}. Here is a practical look at why it matters now.\n\n## Why this topic is trending\n\n- Readers want clear, actionable takes—not hype.\n- The ${cat} space is moving fast in 2026.\n- A strong point of view helps you stand out.\n\n## What to watch next\n\nStart with one concrete example from your experience, add a data point or quote, and end with a single action step for the reader.\n\n## Conclusion\n\n${title} is not just a headline—it is an invitation to share what you have learned. Ship the draft, gather feedback, and refine in public.`;

    default:
      return "Unknown action.";
  }
}

export async function runAiAssist(
  input: AssistInput
): Promise<{ result: string | string[]; source: AiSource }> {
  const contentLimit = input.action === "article-summary" ? 14000 : 8000;
  const userPayload = JSON.stringify({
    title: input.title,
    excerpt: input.excerpt,
    content: input.content?.slice(0, contentLimit),
    category: input.category,
    imagePrompt: input.imagePrompt,
  });

  if (input.action === "generate-image") {
    const prompt =
      input.imagePrompt?.trim() ||
      `Blog cover: ${input.title || "ContentVerse article"}, ${input.category || "technology"} theme`;
    if (isGeminiConfigured()) {
      const image = await callGeminiImage(prompt);
      if (image) return { result: image, source: "gemini" };
    }
    return { result: buildPlaceholderImageUrl(prompt), source: "local" };
  }

  const prompts: Record<Exclude<AiAction, "generate-image">, { system: string; expect: "text" | "list" }> = {
    summarize: {
      system: "Summarize the blog draft in 2-3 sentences for a card excerpt. Plain text only.",
      expect: "text",
    },
    "article-summary": {
      system: `You summarize blog articles for busy readers. Write exactly ${SHORTS_SUMMARY_MIN_WORDS} words. Use 3-4 short paragraphs. Cover hook, thesis, bullets, quote, code if any, and closing. Plain text only — no markdown.`,
      expect: "text",
    },
    "seo-title": {
      system: "Write one SEO meta title under 70 characters. Return only the title.",
      expect: "text",
    },
    "blog-ideas": {
      system: "Return exactly 5 blog post title ideas as a JSON array of strings.",
      expect: "list",
    },
    excerpt: {
      system: "Write a compelling 1-2 sentence excerpt. Plain text only.",
      expect: "text",
    },
    tags: {
      system: "Return 5 URL slug tags as a JSON array of lowercase hyphenated strings.",
      expect: "list",
    },
    "image-prompt": {
      system: "Write one detailed image generation prompt for a blog cover. Plain text only.",
      expect: "text",
    },
    "expand-thesis": {
      system: "Outline a blog structure: hook, 3 sections, conclusion. Use markdown bullets.",
      expect: "text",
    },
    "generate-from-title": {
      system: `Write a complete blog post body in markdown for ContentVerse. Use ## for section headings (do NOT repeat the title as # H1). Include 4-5 sections: introduction, 2-3 substantive sections with paragraphs and optional bullet lists, and conclusion. Target 650-900 words. Engaging, informative tone. Return ONLY markdown body — no frontmatter, no title line.`,
      expect: "text",
    },
  };

  const p = prompts[input.action];
  let systemPrompt = p.system;
  if (input.action === "article-summary") {
    const articleWords = countWords(markdownToPlainText(input.content || ""));
    const { min, max } = getSummaryWordTargets(articleWords);
    systemPrompt = `You summarize blog articles for busy readers. Write exactly ${min} words (never fewer, never more than ${max}). Use 3-4 short paragraphs separated by blank lines. Cover: hook, thesis, list items in one tight sentence, quote if any, code/workflow in plain English, closing. Do NOT repeat the headline as sentence one. Never say "this article". Plain text only — no markdown, no bullet symbols.`;
  }
  const tokens =
    input.action === "article-summary"
      ? 1024
      : input.action === "generate-from-title"
        ? 2048
        : 512;
  const { text: ai, source } = await callAiText(systemPrompt, userPayload, tokens);

  if (ai) {
    if (input.action === "article-summary" && typeof ai === "string") {
      const { summary } = finalizeArticleSummary(
        ai,
        input.content || "",
        input.title
      );
      return { result: summary, source };
    }
    if (p.expect === "list") {
      try {
        const parsed = JSON.parse(ai) as string[];
        if (Array.isArray(parsed)) {
          return { result: parsed.slice(0, 5), source };
        }
      } catch {
        const lines = ai.split("\n").filter((l) => l.trim()).slice(0, 5);
        return { result: lines, source };
      }
    }
    return { result: ai, source };
  }

  const local = heuristicAssist(input);
  if (input.action === "article-summary" && typeof local === "string") {
    const { summary } = finalizeArticleSummary(local, input.content || "", input.title);
    return { result: summary, source: "local" };
  }
  return { result: local, source: "local" };
}

/** Placeholder image URL from prompt (no paid API required). */
export function buildPlaceholderImageUrl(prompt: string): string {
  const seed = encodeURIComponent(prompt.slice(0, 80) || "contentverse");
  return `https://picsum.photos/seed/${seed}/1600/900`;
}

/** Generate poll question + 3 options from article context. */
export async function generatePollFromArticle(input: {
  title: string;
  category?: string;
  tags?: string[];
  excerpt?: string;
}): Promise<{ question: string; options: string[] }> {
  const fallback = buildHeuristicPoll(input);

  const system =
    'Create a quick reader poll for a blog article. Return ONLY valid JSON: {"question":"...","options":["A","B","C"]}. Question must relate to the article topic. Exactly 3 short option labels (2-5 words each).';
  const user = JSON.stringify(input);

  const { text } = await callAiText(system, user);
  if (text) {
    try {
      const json = JSON.parse(text.replace(/```json|```/g, "").trim()) as {
        question?: string;
        options?: string[];
      };
      if (json.question && Array.isArray(json.options) && json.options.length >= 2) {
        return {
          question: json.question.slice(0, 200),
          options: json.options.slice(0, 4).map((o) => String(o).slice(0, 60)),
        };
      }
    } catch {
      /* use fallback */
    }
  }

  return fallback;
}

export function buildHeuristicPoll(input: {
  title: string;
  category?: string;
  tags?: string[];
}): { question: string; options: string[] } {
  const topic = input.tags?.[0] || input.category || "this topic";
  const title = input.title.toLowerCase();

  if (title.includes("ai") || topic.toLowerCase().includes("ai")) {
    return {
      question: "How are you using AI in your daily work?",
      options: ["Every day", "Sometimes", "Not yet"],
    };
  }
  if (title.includes("future") || title.includes("2026")) {
    return {
      question: "Do you feel ready for what's coming next?",
      options: ["Absolutely", "Getting there", "Not really"],
    };
  }

  return {
    question: `What's your take on ${topic}?`,
    options: ["Love it", "It's okay", "Need to learn more"],
  };
}
