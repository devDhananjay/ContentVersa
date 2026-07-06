import { NextResponse } from "next/server";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { requireUserId, resolveUserId } from "@/lib/auth/resolve-user-id";
import { fetchTmdbMoviesByIds } from "@/lib/cineverse/tmdb-hub";
import {
  addToMovieWatchlist,
  getUserMovieWatchlist,
  getUserMovieWatchlistIds,
  removeFromMovieWatchlist,
} from "@/lib/cineverse/watchlist-db";
import { isDatabaseConfigured } from "@/lib/prisma";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ movies: [], ids: [], loggedIn: false });
  }

  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ movies: [], ids: [], loggedIn: false });
  }

  const userId = await resolveUserId(session);
  if (!userId) {
    return NextResponse.json({ movies: [], ids: [], loggedIn: false });
  }

  const [movies, ids] = await Promise.all([
    getUserMovieWatchlist(userId),
    getUserMovieWatchlistIds(userId),
  ]);

  return NextResponse.json({ movies, ids, loggedIn: true });
}

export async function POST(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const body = (await req.json()) as { tmdbId?: string };
    const tmdbId = body.tmdbId?.trim();
    if (!tmdbId || !/^\d+$/.test(tmdbId)) {
      return NextResponse.json({ error: "Valid tmdbId required" }, { status: 400 });
    }

    const [movie] = await fetchTmdbMoviesByIds([tmdbId]);
    if (!movie) {
      return NextResponse.json({ error: "Movie not found on TMDB" }, { status: 404 });
    }

    const ids = await addToMovieWatchlist(userId, tmdbId);
    const movies = await getUserMovieWatchlist(userId);

    return NextResponse.json({ ok: true, ids, movies });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    const status = msg.includes("Unauthorized") || msg.includes("sign in") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const tmdbId = new URL(req.url).searchParams.get("tmdbId")?.trim();
    if (!tmdbId) {
      return NextResponse.json({ error: "tmdbId required" }, { status: 400 });
    }

    const ids = await removeFromMovieWatchlist(userId, tmdbId);
    const movies = ids.length ? await getUserMovieWatchlist(userId) : [];

    return NextResponse.json({ ok: true, ids, movies });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    const status = msg.includes("Unauthorized") || msg.includes("sign in") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
