import type { FeedItem } from "./types";

type GhRepo = {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
};

export async function fetchGitHubTrendingFeed(limit = 8): Promise<FeedItem[]> {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const date = since.toISOString().slice(0, 10);
  const q = encodeURIComponent(`created:>${date}`);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ContentVerse",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=${limit}`,
    { headers, next: { revalidate: 900 } }
  );
  if (!res.ok) return [];

  const data = (await res.json()) as { items?: GhRepo[] };
  return (data.items ?? []).map((repo) => ({
    id: String(repo.id),
    title: repo.full_name,
    externalUrl: repo.html_url,
    subtitle: repo.description || undefined,
    description: repo.description || undefined,
    image: `https://opengraph.githubassets.com/1/${repo.full_name}`,
    meta: [
      repo.stargazers_count ? `★ ${repo.stargazers_count}` : null,
      repo.language,
    ]
      .filter(Boolean)
      .join(" · "),
  }));
}
