import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { StreamingProvider } from "@/lib/cineverse/types";
import { justWatchSearchUrl } from "@/lib/cineverse/ott-affiliates";

export function StreamingProviders({
  providers,
  movieTitle,
}: {
  providers: StreamingProvider[];
  movieTitle: string;
}) {
  if (!providers.length) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
        No India streaming data from TMDB yet.{" "}
        <a
          href={justWatchSearchUrl(movieTitle)}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="font-medium text-red-400 underline"
        >
          Search where to watch
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Watch in India
      </p>
      <div className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <a
            key={`${p.id}-${p.type}`}
            href={p.watchUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-xs font-semibold transition hover:border-red-400/40 hover:bg-red-500/10"
          >
            {p.logoUrl ? (
              <Image
                src={p.logoUrl}
                alt=""
                width={24}
                height={24}
                className="rounded-md"
              />
            ) : null}
            <span>{p.name}</span>
            <span className="text-[10px] uppercase text-muted-foreground">
              {p.type}
            </span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">
        Links open provider search — affiliate partnerships may earn commission.
      </p>
    </div>
  );
}
