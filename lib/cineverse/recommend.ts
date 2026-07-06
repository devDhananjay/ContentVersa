import { callGeminiText, isGeminiConfigured } from "@/lib/ai/gemini";
import { fetchCineverseHubData } from "./tmdb-hub";
import type { CineMovie, CineRecommendResult } from "./types";

export type RecommendInput = {
  mood: string;
  language?: string;
  ott?: string;
};

function localRecommend(
  movies: CineMovie[],
  input: RecommendInput
): CineRecommendResult {
  const mood = input.mood.toLowerCase();
  const filtered = [...movies].sort(() => Math.random() - 0.5).slice(0, 3);
  const picks = filtered.map((movie, i) => ({
    movie,
    reason:
      i === 0
        ? `Matches your “${input.mood}” mood — strong ratings this week.`
        : i === 1
          ? `Great for ${input.language ?? "Hindi/English"} audiences on Indian OTT.`
          : "Trending with ContentVerse readers right now.",
  }));

  return {
    blurb: `Here are three picks for a ${mood} night in — save any title to your watchlist.`,
    picks,
    source: "local",
  };
}

export async function recommendMovies(input: RecommendInput): Promise<CineRecommendResult> {
  const hub = await fetchCineverseHubData();
  const pool = [...hub.trending, ...hub.nowPlaying, ...hub.upcoming];
  const byId = new Map<string, CineMovie>();
  for (const m of pool) byId.set(m.id, m);
  const movies = [...byId.values()].slice(0, 20);

  if (!movies.length) {
    return {
      blurb: "Add TMDB credentials to enable live recommendations.",
      picks: [],
      source: "local",
    };
  }

  if (!isGeminiConfigured()) {
    return localRecommend(movies, input);
  }

  const catalog = movies
    .map(
      (m) =>
        `- id:${m.id} | ${m.title} | rating:${m.rating ?? "n/a"} | ${m.overview.slice(0, 120)}`
    )
    .join("\n");

  const prompt = `You are CineVerse, an Indian movie & OTT companion on ContentVerse.
User mood: ${input.mood}
Preferred language: ${input.language ?? "any"}
Preferred OTT: ${input.ott ?? "any"}

Pick exactly 3 movies from this catalog (use only listed ids):
${catalog}

Reply with JSON only:
{
  "blurb": "one friendly sentence",
  "picks": [
    { "id": "tmdb_id", "reason": "short reason for Indian viewer" }
  ]
}`;

  const raw = await callGeminiText(
    "You recommend Indian movies and OTT titles. Output valid JSON only.",
    prompt
  );

  if (!raw) return localRecommend(movies, input);

  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(cleaned) as {
      blurb?: string;
      picks?: { id: string; reason: string }[];
    };
    const picks = (parsed.picks ?? [])
      .map((p) => {
        const movie = byId.get(String(p.id));
        if (!movie) return null;
        return { movie, reason: p.reason?.slice(0, 200) ?? "Recommended for you." };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .slice(0, 3);

    if (!picks.length) return localRecommend(movies, input);

    return {
      blurb: parsed.blurb?.slice(0, 280) ?? "Picked for your mood tonight.",
      picks,
      source: "gemini",
    };
  } catch {
    return localRecommend(movies, input);
  }
}
