import { callGeminiJson, callGeminiText } from "@/lib/ai/gemini";
import { CATEGORIES } from "@/lib/data/categories";
import { istDayKey } from "@/lib/engagement/streak";

export type HotTopic = {
  title: string;
  searchIntent: string;
  whyTrending: string;
};

export type HotTopicsResult = {
  topics: HotTopic[];
  source: "gemini" | "fallback";
  warning?: string;
};

const TOPICS_SCHEMA = {
  type: "object",
  properties: {
    topics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          searchIntent: { type: "string" },
          whyTrending: { type: "string" },
        },
        required: ["title", "searchIntent", "whyTrending"],
      },
    },
  },
  required: ["topics"],
};

const CURATED_TOPICS: Partial<Record<string, HotTopic[]>> = {
  movies: [
    {
      title: "Bollywood Box Office 2026: What’s Working for Indian Audiences",
      searchIntent: "bollywood box office 2026 india trends",
      whyTrending: "Theatrical vs OTT splits and star-driven openings dominate reader interest.",
    },
    {
      title: "South Indian Films Going Pan-India: Strategy Behind the Crossover Wave",
      searchIntent: "pan india south movies hindi dubbing 2026",
      whyTrending: "Telugu and Tamil hits continue to reshape national release calendars.",
    },
    {
      title: "OTT vs Theatre in India: Where Indians Watch New Releases Now",
      searchIntent: "ott vs theatre india movie release 2026",
      whyTrending: "Windowing deals and subscription fatigue are a hot debate.",
    },
    {
      title: "Best Hindi Movies to Stream This Week (India Picks)",
      searchIntent: "best hindi movies streaming india this week",
      whyTrending: "Weekly discovery lists drive steady search traffic.",
    },
    {
      title: "Film Reviews Readers Trust: How to Write Honest Movie Takes",
      searchIntent: "how to write movie reviews india blog",
      whyTrending: "Creator-led reviews outperform generic aggregator blurbs.",
    },
    {
      title: "Indian Film Industry Jobs: Paths Into Direction, Writing and Production",
      searchIntent: "film industry careers india how to start",
      whyTrending: "Young creators search for realistic entry points beyond acting.",
    },
  ],
};

function parseTopicsJson(text: string): HotTopic[] | null {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned) as { topics?: HotTopic[] } | HotTopic[];
    const list = Array.isArray(parsed) ? parsed : parsed.topics;
    if (!Array.isArray(list)) return null;
    return list
      .filter(
        (t) =>
          t &&
          typeof t.title === "string" &&
          typeof t.searchIntent === "string" &&
          typeof t.whyTrending === "string"
      )
      .map((t) => ({
        title: t.title.trim().slice(0, 90),
        searchIntent: t.searchIntent.trim(),
        whyTrending: t.whyTrending.trim(),
      }));
  } catch {
    return null;
  }
}

function buildFallbackTopics(categorySlug: string, count: number): HotTopic[] {
  const curated = CURATED_TOPICS[categorySlug];
  if (curated?.length) {
    return curated.slice(0, count);
  }

  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  const name = cat?.name ?? categorySlug;
  const subs = cat?.subcategories?.length
    ? cat.subcategories
    : ["Guides", "Trends", "Reviews", "Explainers", "Lists", "News"];
  const month = new Date().toLocaleString("en-IN", {
    month: "long",
    timeZone: "Asia/Kolkata",
  });

  return subs.slice(0, count).map((sub) => ({
    title: `${name} ${sub}: What Indian Readers Should Know in ${month}`,
    searchIntent: `${name.toLowerCase()} ${sub.toLowerCase()} india ${month.toLowerCase()} 2026`,
    whyTrending: `Fresh ${sub.toLowerCase()} angle for ${name.toLowerCase()} readers this month.`,
  }));
}

async function fetchGeminiTopics(
  categorySlug: string,
  count: number
): Promise<HotTopic[] | null> {
  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  const name = cat?.name ?? categorySlug;
  const subs = cat?.subcategories?.join(", ") ?? "";
  const day = istDayKey();

  const system = `You are an editorial strategist for ContentVerse (contentverse.co.in), an Indian content platform.
Suggest timely, searchable article ideas that Indian readers would search for today.
Focus on current trends, seasonal events, news angles, and practical guides — not generic listicles.
Return JSON only.`;

  const user = `Today (IST): ${day}
Category: ${name} (${categorySlug})
Subtopics pool: ${subs}

Suggest ${count} hot article ideas for this category right now.
Each title should be specific, SEO-friendly, and under 90 characters.
whyTrending: one sentence on why this matters now in India.

Return JSON: { "topics": [{ "title": "...", "searchIntent": "...", "whyTrending": "..." }] }`;

  const jsonResult = await callGeminiJson<{ topics: HotTopic[] }>(
    system,
    user,
    TOPICS_SCHEMA,
    4096
  );
  if (jsonResult?.topics?.length) {
    return jsonResult.topics;
  }

  const textResult = await callGeminiText(system, user, 4096);
  if (textResult) {
    return parseTopicsJson(textResult);
  }

  return null;
}

/** Suggest current hot/trending article ideas for a category (India-focused). */
export async function suggestHotTopics(
  categorySlug: string,
  count = 6
): Promise<HotTopicsResult> {
  const geminiTopics = await fetchGeminiTopics(categorySlug, count);
  if (geminiTopics?.length) {
    return {
      topics: geminiTopics.slice(0, count),
      source: "gemini",
    };
  }

  return {
    topics: buildFallbackTopics(categorySlug, count),
    source: "fallback",
    warning:
      "Gemini is unavailable or rate-limited — showing editorial starter ideas. You can still generate articles.",
  };
}
