"use client";

import * as React from "react";
import Link from "next/link";
import { Clapperboard } from "lucide-react";
import type { CineMovie } from "@/lib/cineverse/types";
import { MovieCard } from "./movie-card";

export function MovieWatchlistSection() {
  const [movies, setMovies] = React.useState<CineMovie[]>([]);
  const [loggedIn, setLoggedIn] = React.useState<boolean | null>(null);

  const load = React.useCallback(() => {
    fetch("/api/cineverse/watchlist")
      .then((r) => r.json())
      .then((data: { loggedIn?: boolean; movies?: CineMovie[] }) => {
        setLoggedIn(!!data.loggedIn);
        setMovies(data.movies ?? []);
      })
      .catch(() => {
        setLoggedIn(false);
        setMovies([]);
      });
  }, []);

  React.useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener("cineverse-watchlist-changed", onChange);
    return () => window.removeEventListener("cineverse-watchlist-changed", onChange);
  }, [load]);

  if (loggedIn === null) return null;

  if (!loggedIn) {
    return (
      <section className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-card p-6 text-center">
        <Clapperboard className="mx-auto h-8 w-8 text-red-400" />
        <h2 className="mt-3 font-display text-lg font-bold">Your watchlist</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to save movies and track OTT picks across devices.
        </p>
        <Link
          href="/auth/sign-in?next=/cineverse"
          className="mt-4 inline-flex rounded-full bg-red-500 px-5 py-2 text-sm font-bold text-white hover:bg-red-600"
        >
          Sign in
        </Link>
      </section>
    );
  }

  if (!movies.length) {
    return (
      <section className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">
        <h2 className="font-display text-lg font-bold">Your watchlist is empty</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap <strong>Watchlist</strong> on any movie below to save it here.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Your <span className="text-gradient">Watchlist</span>
        </h2>
        <p className="text-sm text-muted-foreground">{movies.length} saved</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} compact />
        ))}
      </div>
    </section>
  );
}
