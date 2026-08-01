/** Semantic hub neighbours for crawlable internal linking (SEO PageRank flow). */

export type RelatedHubId =
  | "ai"
  | "finance"
  | "sports"
  | "cineverse"
  | "goldverse"
  | "moneyverse"
  | "jobs"
  | "results"
  | "tools"
  | "trending"
  | "guides"
  | "blogs";

export type RelatedHubLink = {
  id: RelatedHubId;
  href: string;
  label: string;
};

export const RELATED_HUB_CATALOG: Record<RelatedHubId, RelatedHubLink> = {
  ai: { id: "ai", href: "/ai", label: "ContentVerse India AI" },
  finance: { id: "finance", href: "/finance", label: "Finance" },
  sports: { id: "sports", href: "/sports", label: "Sports" },
  cineverse: { id: "cineverse", href: "/cineverse", label: "CineVerse" },
  goldverse: { id: "goldverse", href: "/goldverse", label: "GoldVerse" },
  moneyverse: { id: "moneyverse", href: "/moneyverse", label: "MoneyVerse" },
  jobs: { id: "jobs", href: "/jobs", label: "Jobs" },
  results: { id: "results", href: "/results", label: "Sarkari Result" },
  tools: { id: "tools", href: "/tools", label: "India Tools" },
  trending: { id: "trending", href: "/trending", label: "Trending Now" },
  guides: { id: "guides", href: "/guides", label: "India Guides" },
  blogs: { id: "blogs", href: "/blogs", label: "Blogs" },
};

/** Current hub → related hubs (order = priority). Current is always excluded at render. */
export const RELATED_HUB_GRAPH: Record<RelatedHubId, RelatedHubId[]> = {
  finance: ["moneyverse", "goldverse", "tools", "ai", "guides", "blogs"],
  moneyverse: ["finance", "tools", "ai", "goldverse", "guides"],
  goldverse: ["finance", "moneyverse", "tools", "guides"],
  ai: ["moneyverse", "tools", "finance", "jobs", "guides"],
  tools: ["moneyverse", "finance", "ai", "jobs", "guides", "results"],
  jobs: ["results", "guides", "tools", "ai", "blogs"],
  results: ["jobs", "guides", "tools", "ai"],
  sports: ["guides", "trending", "blogs", "ai"],
  cineverse: ["guides", "trending", "blogs", "ai"],
  trending: ["guides", "sports", "finance", "jobs", "ai", "cineverse"],
  guides: ["tools", "jobs", "sports", "cineverse", "trending", "ai"],
  blogs: ["trending", "guides", "finance", "sports", "jobs", "ai"],
};

export function getRelatedHubLinks(
  current: RelatedHubId,
  limit = 6
): RelatedHubLink[] {
  const ids = RELATED_HUB_GRAPH[current] ?? [];
  return ids
    .filter((id) => id !== current)
    .slice(0, limit)
    .map((id) => RELATED_HUB_CATALOG[id])
    .filter(Boolean);
}
