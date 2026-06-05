"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { playerFaceImageUrl } from "@/lib/sports/transformers";
import type { PlayerSearchResult } from "@/lib/sports/types";

interface PlayerSearchProps {
  autoFocus?: boolean;
  initialQuery?: string;
}

export function PlayerSearch({ autoFocus, initialQuery = "" }: PlayerSearchProps) {
  const [query, setQuery] = React.useState(initialQuery);
  const [results, setResults] = React.useState<PlayerSearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  React.useEffect(() => {
    if (initialQuery.length >= 2) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/sports/players/search?q=${encodeURIComponent(q)}`
        );
        const json = await res.json();
        setResults(json.data ?? []);
        setSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search players by name (e.g. Kohli, Smith)..."
          className="pl-10 h-12 rounded-xl"
          autoFocus={autoFocus}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {searched && !loading && results.length === 0 && query.trim().length >= 2 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No players found for &quot;{query.trim()}&quot;
        </p>
      )}

      {results.length > 0 && (
        <ul className="rounded-2xl border divide-y overflow-hidden">
          {results.map((p) => (
            <li key={p.id}>
              <Link
                href={`/sports/player/${p.id}`}
                className="flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                  {playerFaceImageUrl(p.faceImageId) ? (
                    <Image
                      src={playerFaceImageUrl(p.faceImageId)!}
                      alt={p.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold">
                      {p.name.slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.teamName}</p>
                </div>
                {p.dob && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {p.dob}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
