import Link from "next/link";
import { Film, Play } from "lucide-react";
import type { ReelItem } from "@/lib/reels/types";
import { formatNumber } from "@/lib/utils";

interface Props {
  reels: ReelItem[];
  authorFirstName: string;
}

/** Profile-only archive — includes reels older than the 24h discovery window. */
export function ProfileReelsSection({ reels, authorFirstName }: Props) {
  if (!reels.length) return null;

  return (
    <section className="mt-12" id="profile-reels">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="v2-eyebrow inline-flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5" />
            Reels
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight">
            {authorFirstName}&apos;s reels
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All published clips — including ones that have left the home feed after 24 hours.
          </p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {reels.map((reel) => {
          const thumb = reel.thumbnailUrl || reel.mediaUrl;
          return (
            <Link
              key={reel.id}
              href={`/reels/${reel.id}`}
              className="group w-[120px] shrink-0 sm:w-[130px]"
              title={reel.caption}
            >
              <div className="relative h-[200px] w-full overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-sm transition group-hover:ring-2 group-hover:ring-primary/30 sm:h-[220px]">
                {reel.mediaType === "VIDEO" ? (
                  <video
                    src={reel.mediaUrl}
                    poster={thumb}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/45 text-white backdrop-blur">
                  <Play className="h-3.5 w-3.5 fill-current" />
                </span>
                <p className="absolute bottom-2 left-2 right-2 text-[11px] font-medium text-white/90">
                  {formatNumber(reel.views)} views
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
