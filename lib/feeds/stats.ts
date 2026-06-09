export interface FeedItemStats {
  points?: number;
  comments?: number;
  votes?: number;
  upvotes?: number;
  stars?: number;
  rating?: number;
  downloads?: number;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatFeedMeta(stats?: FeedItemStats): string | undefined {
  if (!stats) return undefined;

  const parts: string[] = [];
  if (stats.points != null) parts.push(`${stats.points.toLocaleString()} pts`);
  if (stats.comments != null) {
    parts.push(`${stats.comments.toLocaleString()} comments`);
  }
  if (stats.votes != null) parts.push(`${stats.votes.toLocaleString()} votes`);
  if (stats.upvotes != null) {
    parts.push(`${stats.upvotes.toLocaleString()} upvotes`);
  }
  if (stats.stars != null) parts.push(`★ ${stats.stars.toLocaleString()}`);
  if (stats.rating != null) parts.push(`★ ${stats.rating.toFixed(1)}`);
  if (stats.downloads != null) {
    parts.push(`${formatCount(stats.downloads)} downloads`);
  }

  return parts.length ? parts.join(" · ") : undefined;
}
