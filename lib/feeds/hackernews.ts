import { fetchLinkPreview } from "./link-preview";
import type { FeedItem } from "./types";

type HnHit = {
  objectID: string;
  title: string | null;
  url: string | null;
  story_url: string | null;
  story_text: string | null;
  points: number | null;
  num_comments: number | null;
};

async function enrichHit(hit: HnHit): Promise<FeedItem> {
  const articleUrl =
    hit.url || hit.story_url || `https://news.ycombinator.com/item?id=${hit.objectID}`;

  let image: string | undefined;
  let subtitle = hit.story_text?.trim() || undefined;

  if (hit.url) {
    const preview = await fetchLinkPreview(hit.url);
    image = preview?.image;
    subtitle = preview?.description?.slice(0, 160) || subtitle;
  }

  return {
    id: hit.objectID,
    title: hit.title as string,
    externalUrl: articleUrl,
    subtitle,
    meta: [
      hit.points != null ? `${hit.points} pts` : null,
      hit.num_comments != null ? `${hit.num_comments} comments` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    image,
  };
}

export async function fetchHackerNewsFeed(limit = 8): Promise<FeedItem[]> {
  const res = await fetch(
    `https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=${limit}`,
    { headers: { Accept: "application/json" }, next: { revalidate: 900 } }
  );
  if (!res.ok) return [];

  const data = (await res.json()) as { hits?: HnHit[] };
  const hits = (data.hits ?? []).filter((hit) => hit.title);

  return Promise.all(hits.map(enrichHit));
}
