import Image from "next/image";
import { Clapperboard, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCineverseHubDataCached } from "@/lib/cineverse/data";
import { MovieGrid } from "./movie-grid";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600";

export async function CineverseBrowseShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const hub = await getCineverseHubDataCached();

  return (
    <div>
      <section className="relative mx-0 h-[200px] overflow-hidden rounded-b-2xl md:h-[240px]">
        <Image
          src={HERO_IMAGE}
          alt="CineVerse — movies and OTT"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/50" />
        <div className="container relative flex h-full flex-col justify-end pb-6">
          <Badge variant="outline" className="mb-2 h-5 w-fit gap-1 text-[10px]">
            <Clapperboard className="h-2.5 w-2.5" /> AI Movie & OTT Companion
          </Badge>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-4xl">
            CineVerse
          </h1>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground md:text-sm">
            Trending films, India release dates, your watchlist & movie news — on
            ContentVerse India
          </p>
        </div>
      </section>

      <div className="container space-y-8 py-6">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Film className="h-5 w-5 text-red-400" />
            <h2 className="font-display text-xl font-bold md:text-2xl">
              Trending <span className="text-gradient">Today</span>
            </h2>
          </div>
          <MovieGrid
            movies={hub.trending}
            emptyMessage="Add TMDB_API_KEY or TMDB_READ_ACCESS_TOKEN to show live movie data."
          />
        </section>

        <div className="border-t border-border/40 pt-2">{children}</div>
      </div>
    </div>
  );
}
