import type { FeedItem } from "./types";

type FreeGame = {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
};

export async function fetchFreeToGameFeed(limit = 8): Promise<FeedItem[]> {
  const res = await fetch(
    `https://www.freetogame.com/api/games?sort-by=popularity&sort-order=desc&page-size=${limit}`,
    { headers: { Accept: "application/json" }, next: { revalidate: 900 } }
  );
  if (!res.ok) return [];

  const games = (await res.json()) as FreeGame[];
  return games.slice(0, limit).map((game) => ({
    id: String(game.id),
    title: game.title,
    externalUrl: game.game_url,
    subtitle: game.short_description?.slice(0, 120) || undefined,
    description: game.short_description || undefined,
    meta: [game.genre, game.platform].filter(Boolean).join(" · "),
    image: game.thumbnail,
  }));
}
