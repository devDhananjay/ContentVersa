import type { FeedItem } from "./types";

type HfModel = {
  id: string;
  downloads?: number;
  likes?: number;
};

type HfPaper = {
  id: string;
  title: string;
  upvotes?: number;
  thumbnailUrl?: string;
};

export async function fetchHuggingFaceFeed(limit = 6): Promise<FeedItem[]> {
  const [modelsRes, papersRes] = await Promise.all([
    fetch(
      `https://huggingface.co/api/models?sort=downloads&direction=-1&limit=${limit}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 900 } }
    ),
    fetch(
      `https://huggingface.co/api/papers?limit=${Math.min(limit, 4)}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 900 } }
    ),
  ]);

  const items: FeedItem[] = [];

  if (modelsRes.ok) {
    const models = (await modelsRes.json()) as HfModel[];
    for (const model of models) {
      items.push({
        id: `model-${model.id}`,
        title: model.id,
        externalUrl: `https://huggingface.co/${model.id}`,
        subtitle: "Trending model",
        image: `https://cdn-thumbnails.huggingface.co/social-thumbnails/models/${encodeURIComponent(model.id)}.png`,
        meta: model.downloads
          ? `${formatCount(model.downloads)} downloads`
          : undefined,
      });
    }
  }

  if (papersRes.ok) {
    const papers = (await papersRes.json()) as HfPaper[];
    for (const paper of papers) {
      items.push({
        id: `paper-${paper.id}`,
        title: paper.title,
        externalUrl: `https://huggingface.co/papers/${paper.id}`,
        subtitle: "Research paper",
        image:
          paper.thumbnailUrl ||
          `https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/${paper.id}.png`,
        meta: paper.upvotes ? `${paper.upvotes} upvotes` : undefined,
      });
    }
  }

  return items.slice(0, limit + 2);
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
