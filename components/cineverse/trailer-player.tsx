"use client";

import * as React from "react";
import type { CineTrailer } from "@/lib/cineverse/types";

export function TrailerPlayer({ trailers }: { trailers: CineTrailer[] }) {
  const [active, setActive] = React.useState(0);
  const trailer = trailers[active];
  if (!trailer?.youtubeUrl) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Trailers
      </p>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/60 bg-black">
        <iframe
          title={trailer.name}
          src={`https://www.youtube.com/embed/${trailer.key}?rel=0`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {trailers.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {trailers.map((t, i) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                i === active
                  ? "border-red-400/50 bg-red-500/15 text-red-200"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.type}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
