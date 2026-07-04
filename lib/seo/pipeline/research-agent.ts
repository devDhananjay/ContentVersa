import { callGeminiText, isGeminiConfigured } from "@/lib/ai/gemini";
import { CATEGORIES } from "@/lib/data/categories";
import { suggestHotTopics } from "@/lib/seo/hot-topics";
import type { ResearchTopic } from "@/lib/seo/pipeline/types";

function scoreTopic(title: string, intent: string, why: string): {
  competition: ResearchTopic["competition"];
  seoScore: number;
  keywords: string[];
} {
  const text = `${title} ${intent} ${why}`.toLowerCase();
  const yearBoost = /2026|2025/.test(text) ? 8 : 0;
  const indiaBoost = /india|indian|rupee|sarkari|upi|nirf|jee|neet/.test(text) ? 10 : 0;
  const howToBoost = /how to|guide|checklist|vs |best |tips/.test(text) ? 8 : 0;
  const genericPenalty = /what to know today|latest updates|everything you need/.test(text)
    ? -20
    : 0;
  const longTail = intent.split(/\s+/).length >= 4 ? 12 : 0;

  let seoScore = 55 + yearBoost + indiaBoost + howToBoost + longTail + genericPenalty;
  seoScore = Math.max(35, Math.min(96, seoScore));

  const competition: ResearchTopic["competition"] =
    seoScore >= 78 ? "low" : seoScore >= 60 ? "medium" : "high";

  const keywords = [
    ...new Set(
      intent
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3)
        .slice(0, 6)
    ),
  ];

  return { competition, seoScore, keywords };
}

function enrichTopics(
  topics: { title: string; searchIntent: string; whyTrending: string }[]
): ResearchTopic[] {
  return topics.map((t) => {
    const scored = scoreTopic(t.title, t.searchIntent, t.whyTrending);
    return {
      title: t.title,
      searchIntent: t.searchIntent,
      whyTrending: t.whyTrending,
      competition: scored.competition,
      seoScore: scored.seoScore,
      keywords: scored.keywords,
      sources: [
        "Google Trends (India)",
        "News & search intent signals",
        "Category demand patterns",
      ],
    };
  });
}

/** Research agent: trending topics + low-competition / SEO scoring. */
export async function runResearchAgent(
  categorySlug: string,
  count = 6
): Promise<{ topics: ResearchTopic[]; source: string; warning?: string }> {
  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!cat) throw new Error("Invalid category");

  const { topics, source, warning } = await suggestHotTopics(categorySlug, count);
  let enriched = enrichTopics(topics);

  if (isGeminiConfigured()) {
    try {
      const system = `You refine blog topic research for India SEO. Return ONLY JSON:
{"topics":[{"title":"...","searchIntent":"...","whyTrending":"...","competition":"low|medium|high","seoScore":0-100,"keywords":["..."],"sources":["..."]}]}
Rules: prefer low-competition long-tail India queries, concrete titles (no "What to Know Today"), seoScore 40-95. Exactly ${count} topics.`;
      const user = JSON.stringify({
        category: cat.name,
        categorySlug,
        seedTopics: topics,
      });
      const text = await callGeminiText(system, user, 4096);
      if (text) {
        const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        const parsed = JSON.parse(cleaned) as { topics?: ResearchTopic[] };
        if (Array.isArray(parsed.topics) && parsed.topics.length) {
          enriched = parsed.topics.slice(0, count).map((t) => {
            const fallback = scoreTopic(
              t.title || "",
              t.searchIntent || "",
              t.whyTrending || ""
            );
            return {
              title: (t.title || "").trim().slice(0, 90),
              searchIntent: (t.searchIntent || fallback.keywords.join(" ")).trim(),
              whyTrending: (t.whyTrending || "Trending in category").trim(),
              competition:
                t.competition === "low" || t.competition === "medium" || t.competition === "high"
                  ? t.competition
                  : fallback.competition,
              seoScore: Math.max(35, Math.min(96, Number(t.seoScore) || fallback.seoScore)),
              keywords: Array.isArray(t.keywords) && t.keywords.length
                ? t.keywords.map(String).slice(0, 8)
                : fallback.keywords,
              sources: Array.isArray(t.sources) && t.sources.length
                ? t.sources.map(String).slice(0, 5)
                : [
                    "Google Trends (India)",
                    "News & search intent signals",
                    "Category demand patterns",
                  ],
            };
          });
        }
      }
    } catch {
      // keep heuristic enrichment
    }
  }

  enriched.sort((a, b) => b.seoScore - a.seoScore);
  return { topics: enriched, source, warning };
}
