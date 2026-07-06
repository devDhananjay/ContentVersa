"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CineRecommendResult } from "@/lib/cineverse/types";

const MOODS = ["Bollywood weekend", "OTT binge", "South masala", "Family night", "Thriller"];

export function CineverseAiRecommend() {
  const [mood, setMood] = React.useState("Bollywood weekend");
  const [language, setLanguage] = React.useState("Hindi");
  const [ott, setOtt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<CineRecommendResult | null>(null);

  async function run() {
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

  return (
    <section className="overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-500/10 via-card to-card p-6 md:p-8">
      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
        <Sparkles className="h-3.5 w-3.5" />
        AI picks
      </p>
      <h2 className="mt-2 font-display text-xl font-bold md:text-2xl">
        What should I watch tonight?
      </h2>

      <div className="mt-4 flex flex-wrap gap-2">
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

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Input
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="Language (Hindi, Tamil…)"
          className="h-10 text-sm"
        />
        <Input
          value={ott}
          onChange={(e) => setOtt(e.target.value)}
          placeholder="OTT (Netflix, Prime…)"
          className="h-10 text-sm"
        />
      </div>

      <Button
        className="mt-4 gap-2"
        onClick={run}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
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
    </section>
  );
}
