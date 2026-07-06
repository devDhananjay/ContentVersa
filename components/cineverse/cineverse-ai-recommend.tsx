"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Search, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CineMovie, CineRecommendResult } from "@/lib/cineverse/types";

const MOODS = ["Bollywood weekend", "OTT binge", "South masala", "Family night", "Thriller"];

export function CineverseAiRecommend() {
  const [mood, setMood] = React.useState("Bollywood weekend");
  const [language, setLanguage] = React.useState("Hindi");
  const [ott, setOtt] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<CineMovie[] | null>(null);
  const [searchedQuery, setSearchedQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<CineRecommendResult | null>(null);

  const runSearch = React.useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setSearchResults(null);
      setSearchedQuery("");
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/cineverse/search?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = (await res.json()) as { movies?: CineMovie[]; query?: string };
      setSearchResults(data.movies ?? []);
      setSearchedQuery(data.query ?? trimmed);
    } catch {
      toast.error("Movie search failed");
      setSearchResults([]);
      setSearchedQuery(trimmed);
    } finally {
      setSearching(false);
    }
  }, []);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults(null);
      setSearchedQuery("");
      return;
    }

    const timer = window.setTimeout(() => {
      void runSearch(query);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query, runSearch]);

  async function runRecommend() {
    setLoading(true);
    try {
      const res = await fetch("/api/cineverse/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, language, ott: ott || undefined }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as CineRecommendResult;
      setResult(data);
    } catch {
      toast.error("Could not get recommendations");
    } finally {
      setLoading(false);
    }
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    void runSearch(query);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-500/10 via-card to-card p-6 md:p-8">
      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
        <Sparkles className="h-3.5 w-3.5" />
        AI picks
      </p>

      <form onSubmit={onSearchSubmit} className="mt-4">
        <label htmlFor="cineverse-movie-search" className="sr-only">
          Search movies
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="cineverse-movie-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies — Pushpa, Inception, Stree…"
            className="h-11 pl-9 pr-24 text-sm"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 px-3 text-xs"
            disabled={searching || query.trim().length < 2}
          >
            {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
          </Button>
        </div>
      </form>

      {searching && !searchResults ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching TMDB…
        </div>
      ) : null}

      {searchResults && searchedQuery ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            {searchResults.length
              ? `${searchResults.length} result${searchResults.length === 1 ? "" : "s"} for “${searchedQuery}”`
              : `No movies found for “${searchedQuery}”`}
          </p>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {searchResults.map((movie) => (
                <Link
                  key={movie.id}
                  href={movie.href}
                  className="group flex gap-2 rounded-xl border border-border/60 bg-card/60 p-2 transition hover:border-red-400/40"
                >
                  <div className="relative h-[72px] w-12 shrink-0 overflow-hidden rounded-md bg-muted/40">
                    {movie.posterUrl ? (
                      <Image
                        src={movie.posterUrl}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-bold leading-snug group-hover:text-red-400">
                      {movie.title}
                    </p>
                    {movie.rating ? (
                      <p className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {movie.rating}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 border-t border-border/40 pt-6">
        <h2 className="font-display text-xl font-bold md:text-2xl">
          What should I watch tonight?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Mood choose karo, optional language/OTT bharo — phir AI 3 picks suggest karega.
          Yeh movie search nahi hai.
        </p>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Mood
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                mood === m
                  ? "border-red-400/50 bg-red-500/15 text-red-200"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="cineverse-ai-language"
              className="mb-1.5 block text-xs font-semibold text-muted-foreground"
            >
              Preferred language <span className="font-normal">(optional)</span>
            </label>
            <Input
              id="cineverse-ai-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. Hindi, Tamil, English"
              className="h-10 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="cineverse-ai-ott"
              className="mb-1.5 block text-xs font-semibold text-muted-foreground"
            >
              Preferred OTT <span className="font-normal">(optional)</span>
            </label>
            <Input
              id="cineverse-ai-ott"
              value={ott}
              onChange={(e) => setOtt(e.target.value)}
              placeholder="e.g. Netflix, Prime, Hotstar"
              className="h-10 text-sm"
            />
          </div>
        </div>

        <Button
          type="button"
          className="mt-4 gap-2"
          onClick={runRecommend}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Get AI recommendations
        </Button>

        {result ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">{result.blurb}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {result.picks.map(({ movie, reason }) => (
                <Link
                  key={movie.id}
                  href={movie.href}
                  className="flex gap-3 rounded-xl border border-border/60 bg-card/60 p-3 transition hover:border-red-400/40"
                >
                  {movie.posterUrl ? (
                    <Image
                      src={movie.posterUrl}
                      alt=""
                      width={56}
                      height={84}
                      className="h-[84px] w-14 shrink-0 rounded-lg object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-bold">{movie.title}</p>
                    <p className="mt-1 line-clamp-3 text-[11px] text-muted-foreground">
                      {reason}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Powered by {result.source === "gemini" ? "Gemini AI" : "local picks"} · TMDB data
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
