import { prisma } from "@/lib/prisma";
import { fetchTmdbMoviesByIds } from "./tmdb-hub";
import type { CineMovie } from "./types";

export async function getUserMovieWatchlistIds(userId: string): Promise<string[]> {
  const rows = await prisma.movieWatchlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { tmdbId: true },
  });
  return rows.map((r) => r.tmdbId);
}

export async function getUserMovieWatchlist(userId: string): Promise<CineMovie[]> {
  const ids = await getUserMovieWatchlistIds(userId);
  if (!ids.length) return [];
  const movies = await fetchTmdbMoviesByIds(ids);
  const byId = new Map(movies.map((m) => [m.id, m]));
  return ids.map((id) => byId.get(id)).filter((m): m is CineMovie => !!m);
}

export async function addToMovieWatchlist(
  userId: string,
  tmdbId: string
): Promise<string[]> {
  await prisma.movieWatchlistItem.upsert({
    where: { userId_tmdbId: { userId, tmdbId } },
    create: { userId, tmdbId },
    update: {},
  });
  return getUserMovieWatchlistIds(userId);
}

export async function removeFromMovieWatchlist(
  userId: string,
  tmdbId: string
): Promise<string[]> {
  await prisma.movieWatchlistItem.deleteMany({
    where: { userId, tmdbId },
  });
  return getUserMovieWatchlistIds(userId);
}

export async function isInMovieWatchlist(
  userId: string,
  tmdbId: string
): Promise<boolean> {
  const row = await prisma.movieWatchlistItem.findUnique({
    where: { userId_tmdbId: { userId, tmdbId } },
  });
  return !!row;
}
