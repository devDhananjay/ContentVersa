import { NextResponse } from "next/server";
import { searchTmdbMovies } from "@/lib/cineverse/tmdb-hub";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ movies: [], query: q });
  }

  const movies = await searchTmdbMovies(q, 12);
  return NextResponse.json({ movies, query: q });
}
