import { cache } from "@/lib/redis";
import { FEED_CACHE_TTL, hasCategoryFeed } from "./constants";
import { fetchLinkPreview, stripHtml } from "./link-preview";
import { getProductHuntToken } from "./producthunt-token";
import { formatFeedMeta } from "./stats";
import type { FeedItem, FeedItemDetail } from "./types";

const LIVE_FETCH = { cache: "no-store" as const };

function itemCacheKey(category: string, id: string) {
  return `feeds:item:${category}:${id}`;
}

export async function cacheFeedItems(category: string, items: FeedItem[]) {
  await Promise.all(
    items.map((item) =>
      cache.set(itemCacheKey(category, item.id), item, FEED_CACHE_TTL)
    )
  );
}

export async function getFeedItemDetail(
  category: string,
  id: string
): Promise<FeedItemDetail | null> {
  if (!hasCategoryFeed(category)) return null;

  const decodedId = decodeURIComponent(id);
  const detail = await fetchFeedItemDetail(category, decodedId);
  if (!detail) {
    const cached = await cache.get<FeedItem>(itemCacheKey(category, decodedId));
    if (cached) return { ...cached, category };
    return null;
  }

  await cache.set(itemCacheKey(category, decodedId), detail, FEED_CACHE_TTL);
  return { ...detail, category };
}

async function fetchFeedItemDetail(
  category: string,
  id: string
): Promise<FeedItem | null> {
  switch (category) {
    case "startups":
      return fetchProductHuntDetail(id);
    case "movies":
      return fetchTmdbDetail(id);
    case "programming":
      return fetchGitHubDetail(id);
    case "technology":
      return fetchHackerNewsDetail(id);
    case "gaming":
      return fetchFreeToGameDetail(id);
    case "ai":
      if (id.startsWith("model-")) return fetchHfModelDetail(id.slice(6));
      if (id.startsWith("paper-")) return fetchHfPaperDetail(id.slice(6));
      return fetchRedditDetail(id);
    default:
      return null;
  }
}

async function fetchProductHuntDetail(id: string): Promise<FeedItem | null> {
  const token = await getProductHuntToken();
  if (!token) return null;

  const res = await fetch("https://api.producthunt.com/v2/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `{
        post(id: ${JSON.stringify(id)}) {
          id
          name
          tagline
          description
          votesCount
          website
          thumbnail { url }
          media { url type }
          topics { edges { node { name } } }
        }
      }`,
    }),
    ...LIVE_FETCH,
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    data?: {
      post?: {
        id: string;
        name: string;
        tagline: string;
        description: string;
        votesCount: number;
        website: string;
        thumbnail?: { url: string } | null;
        media?: { url: string; type: string }[];
        topics?: { edges?: { node: { name: string } }[] };
      };
    };
  };

  const post = data.data?.post;
  if (!post) return null;

  return {
    id: post.id,
    title: post.name,
    externalUrl: post.website || "https://www.producthunt.com",
    subtitle: post.tagline,
    description: post.description || post.tagline,
    stats: { votes: post.votesCount },
    meta: formatFeedMeta({ votes: post.votesCount }),
    image: post.thumbnail?.url,
    gallery: post.media?.filter((m) => m.type === "image").map((m) => m.url),
    topics: post.topics?.edges?.map((e) => e.node.name),
  } as FeedItemDetail;
}

async function fetchTmdbDetail(id: string): Promise<FeedItem | null> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) return null;

  const url = token
    ? `https://api.themoviedb.org/3/movie/${id}`
    : `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;

  const res = await fetch(url, {
    headers: token
      ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
      : { Accept: "application/json" },
    ...LIVE_FETCH,
  });
  if (!res.ok) return null;

  const movie = (await res.json()) as {
    id: number;
    title: string;
    overview: string;
    vote_average: number;
    poster_path: string | null;
    backdrop_path: string | null;
    genres?: { name: string }[];
    homepage?: string;
  };

  return {
    id: String(movie.id),
    title: movie.title,
    externalUrl: movie.homepage || `https://www.themoviedb.org/movie/${movie.id}`,
    description: movie.overview,
    subtitle: movie.overview?.slice(0, 160),
    stats: movie.vote_average ? { rating: movie.vote_average } : undefined,
    meta: formatFeedMeta(
      movie.vote_average ? { rating: movie.vote_average } : undefined
    ),
    image: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : undefined,
    gallery: movie.backdrop_path
      ? [`https://image.tmdb.org/t/p/w780${movie.backdrop_path}`]
      : undefined,
    topics: movie.genres?.map((g) => g.name),
  } as FeedItemDetail;
}

async function fetchGitHubDetail(id: string): Promise<FeedItem | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ContentVerse",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`https://api.github.com/repositories/${id}`, {
    headers,
    ...LIVE_FETCH,
  });
  if (!res.ok) return null;

  const repo = (await res.json()) as {
    id: number;
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    language: string | null;
    topics?: string[];
  };

  return {
    id: String(repo.id),
    title: repo.full_name,
    externalUrl: repo.html_url,
    description: repo.description || undefined,
    subtitle: repo.description || undefined,
    stats: { stars: repo.stargazers_count },
    meta: [
      formatFeedMeta({ stars: repo.stargazers_count }),
      repo.language,
    ]
      .filter(Boolean)
      .join(" · "),
    image: `https://opengraph.githubassets.com/1/${repo.full_name}`,
    topics: repo.topics,
  } as FeedItemDetail;
}

async function fetchHnCommentTexts(kids?: number[]): Promise<string[]> {
  if (!kids?.length) return [];

  const comments = await Promise.all(
    kids.slice(0, 6).map(async (kid) => {
      try {
        const res = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${kid}.json`,
          LIVE_FETCH
        );
        if (!res.ok) return null;
        const comment = (await res.json()) as { text?: string };
        return comment.text ? stripHtml(comment.text) : null;
      } catch {
        return null;
      }
    })
  );

  return comments.filter((c): c is string => Boolean(c));
}

async function fetchHackerNewsDetail(id: string): Promise<FeedItem | null> {
  const res = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
    LIVE_FETCH
  );
  if (!res.ok) return null;

  const item = (await res.json()) as {
    id: number;
    title?: string;
    url?: string;
    text?: string;
    score?: number;
    descendants?: number;
    kids?: number[];
  };
  if (!item.title) return null;

  const preview = item.url ? await fetchLinkPreview(item.url) : null;
  const hnText = item.text ? stripHtml(item.text) : "";
  const comments = await fetchHnCommentTexts(item.kids);

  const descriptionParts = [
    preview?.description,
    hnText,
    comments.length
      ? `Community highlights:\n\n${comments.map((c) => `• ${c}`).join("\n\n")}`
      : null,
  ].filter(Boolean);

  return {
    id: String(item.id),
    title: item.title,
    externalUrl: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
    subtitle: preview?.description?.slice(0, 200) || hnText.slice(0, 200) || undefined,
    description: descriptionParts.join("\n\n").slice(0, 6000) || undefined,
    stats: {
      points: item.score ?? undefined,
      comments: item.descendants ?? undefined,
    },
    meta: formatFeedMeta({
      points: item.score ?? undefined,
      comments: item.descendants ?? undefined,
    }),
    image: preview?.image,
  };
}

async function fetchFreeToGameDetail(id: string): Promise<FeedItem | null> {
  const res = await fetch(`https://www.freetogame.com/api/game?id=${id}`, {
    ...LIVE_FETCH,
  });
  if (!res.ok) return null;

  const game = (await res.json()) as {
    id: number;
    title: string;
    thumbnail: string;
    short_description: string;
    description: string;
    game_url: string;
    genre: string;
    platform: string;
  };

  return {
    id: String(game.id),
    title: game.title,
    externalUrl: game.game_url,
    subtitle: game.short_description,
    description: game.description || game.short_description,
    meta: [game.genre, game.platform].filter(Boolean).join(" · "),
    image: game.thumbnail,
  };
}

async function fetchHfModelDetail(modelId: string): Promise<FeedItem | null> {
  const res = await fetch(`https://huggingface.co/api/models/${modelId}`, {
    ...LIVE_FETCH,
  });
  if (!res.ok) return null;

  const model = (await res.json()) as {
    id: string;
    downloads?: number;
    likes?: number;
    pipeline_tag?: string;
    cardData?: { content?: string };
  };

  return {
    id: `model-${model.id}`,
    title: model.id,
    externalUrl: `https://huggingface.co/${model.id}`,
    subtitle: model.pipeline_tag || "Model",
    description: model.cardData?.content?.slice(0, 1200),
    stats: model.downloads ? { downloads: model.downloads } : undefined,
    meta: formatFeedMeta(
      model.downloads ? { downloads: model.downloads } : undefined
    ),
    image: `https://cdn-thumbnails.huggingface.co/social-thumbnails/models/${encodeURIComponent(model.id)}.png`,
  };
}

async function fetchHfPaperDetail(paperId: string): Promise<FeedItem | null> {
  const res = await fetch(`https://huggingface.co/api/papers/${paperId}`, {
    ...LIVE_FETCH,
  });
  if (!res.ok) return null;

  const paper = (await res.json()) as {
    id: string;
    title: string;
    summary?: string;
    upvotes?: number;
    thumbnailUrl?: string;
  };

  return {
    id: `paper-${paper.id}`,
    title: paper.title,
    externalUrl: `https://huggingface.co/papers/${paper.id}`,
    subtitle: "Research paper",
    description: paper.summary,
    stats: paper.upvotes ? { upvotes: paper.upvotes } : undefined,
    meta: formatFeedMeta(paper.upvotes ? { upvotes: paper.upvotes } : undefined),
    image:
      paper.thumbnailUrl ||
      `https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/${paper.id}.png`,
  };
}

async function fetchRedditDetail(url: string): Promise<FeedItem | null> {
  const cached = await cache.get<FeedItem>(itemCacheKey("ai", url));
  const preview = await fetchLinkPreview(url);

  return {
    id: url,
    title: cached?.title || preview?.title || "Community discussion",
    externalUrl: url,
    subtitle: cached?.subtitle || preview?.description?.slice(0, 160),
    description: preview?.description,
    image: preview?.image,
  };
}
