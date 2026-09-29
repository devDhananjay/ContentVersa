import {
  callGeminiTextWithMeta,
  getGeminiBlogApiKey,
  type GeminiFailure,
} from "../ai/gemini";
import { countAiSmellMarkers } from "./ai-smell";
import { passesArticleQualityGate, wordCount } from "./article-quality";

export type HumanizedArticle = {
  title: string;
  excerpt: string;
  metaDescription: string;
  content: string;
};

export type HumanizeResult = {
  article: HumanizedArticle | null;
  failure?: GeminiFailure;
  reason?: "quota" | "generation" | "still-ai" | "short";
  markersBefore: number;
  markersAfter: number;
};

function parseHumanizeJson(text: string): Partial<HumanizedArticle> | null {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as Partial<HumanizedArticle>;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as Partial<HumanizedArticle>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalize(raw: Partial<HumanizedArticle>, fallbackTitle: string): HumanizedArticle | null {
  const content = String(raw.content || "").trim();
  if (!content) return null;
  const title = String(raw.title || fallbackTitle).trim() || fallbackTitle;
  const excerpt = String(raw.excerpt || "").trim().slice(0, 280);
  const metaDescription = String(raw.metaDescription || excerpt)
    .trim()
    .slice(0, 160);
  if (!excerpt || !metaDescription) return null;
  return { title, excerpt, metaDescription, content };
}

const HUMANIZE_SYSTEM = `You are a senior Indian magazine editor rewriting AI-sounding drafts so they read like a sharp human journalist wrote them for ContentVerse India.

Hard rules:
- Rewrite the FULL article in Markdown (## / ### only — no # H1, do not repeat the title as H1).
- Keep the same topic and useful facts. Do NOT invent statistics, quotes, prices, or laws.
- Voice: first-hand practical India tone — concrete cities, ₹, apps, schemes, hostel/office reality. Short paragraphs. Occasional opinion ("I'd skip X") is good.
- Ban these AI tells completely: "delve", "landscape", "furthermore", "moreover", "in today's digital", "it's important to note", "unlock the potential", "game-changer", "cutting-edge", "leverage", "robust", "seamless", "tapestry", "multifaceted", "in this article we will", "let's explore", "navigating the", "comprehensive guide", "at the end of the day", "plethora", "shed light", "pivotal role".
- No corporate filler. No fake "Introduction:" theatrical openers. Start with a specific scene or problem.
- Keep 900–1400 words unless the source is thinner — then write at least 850 solid words.
- Include 1 short FAQ section (## FAQ) with 3 real questions readers ask.
- End with one practical takeaway paragraph (not "## Conclusion" fluff).
- Return ONLY valid JSON with keys: title, excerpt, metaDescription, content.`;

export async function humanizeArticle(input: {
  title: string;
  category?: string;
  content: string;
  excerpt?: string | null;
}): Promise<HumanizeResult> {
  const markersBefore = countAiSmellMarkers(
    `${input.title}\n${input.excerpt || ""}\n${input.content}`
  );

  const user = `Rewrite this published post so it sounds fully human-written.

Title: ${input.title}
Category: ${input.category || "General"}
Current excerpt: ${input.excerpt || ""}

Draft to rewrite:
${input.content.slice(0, 14000)}

Return JSON only.`;

  const result = await callGeminiTextWithMeta(HUMANIZE_SYSTEM, user, 8192, {
    apiKey: getGeminiBlogApiKey(),
  });

  if (!result.ok) {
    return {
      article: null,
      failure: result.failure,
      reason: result.failure.quotaExceeded ? "quota" : "generation",
      markersBefore,
      markersAfter: markersBefore,
    };
  }

  const parsed = normalize(parseHumanizeJson(result.text) || {}, input.title);
  if (!parsed) {
    return {
      article: null,
      reason: "generation",
      markersBefore,
      markersAfter: markersBefore,
    };
  }

  const markersAfter = countAiSmellMarkers(
    `${parsed.title}\n${parsed.excerpt}\n${parsed.content}`
  );

  if (!passesArticleQualityGate(parsed.content) && wordCount(parsed.content) < 750) {
    return {
      article: null,
      reason: "short",
      markersBefore,
      markersAfter,
    };
  }

  // One retry if AI smell remains high
  if (markersAfter >= 2) {
    const retry = await callGeminiTextWithMeta(
      HUMANIZE_SYSTEM,
      `Your last rewrite still had AI-sounding phrases. Rewrite again harder — remove ALL banned phrases. Keep facts.

Title: ${parsed.title}
Draft:
${parsed.content.slice(0, 12000)}

Return JSON only.`,
      8192,
      { apiKey: getGeminiBlogApiKey() }
    );
    if (retry.ok) {
      const again = normalize(parseHumanizeJson(retry.text) || {}, parsed.title);
      if (again && wordCount(again.content) >= 750) {
        const m2 = countAiSmellMarkers(
          `${again.title}\n${again.excerpt}\n${again.content}`
        );
        return {
          article: again,
          reason: m2 >= 2 ? "still-ai" : undefined,
          markersBefore,
          markersAfter: m2,
        };
      }
    }
  }

  return {
    article: parsed,
    reason: markersAfter >= 2 ? "still-ai" : undefined,
    markersBefore,
    markersAfter,
  };
}
