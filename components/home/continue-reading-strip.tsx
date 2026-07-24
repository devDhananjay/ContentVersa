import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { getContinueReading } from "@/lib/data/reading-history";
import { shouldSkipImageOptimization } from "@/lib/upload";

/** Logged-in users: unfinished articles from reading history. */
export async function ContinueReadingStrip() {
  const session = await getCurrentUser();
  if (!session) return null;

  const userId = await resolveUserId(session).catch(() => null);
  if (!userId) return null;

  const items = await getContinueReading(userId, 8);
  if (!items.length) return null;

  return (
    <section
      id="continue-reading"
      className="scroll-mt-20 border-y border-border/40 bg-muted/15"
      aria-labelledby="continue-reading-heading"
    >
      <div className="container py-8 md:py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-neon-cyan">
              <BookOpen className="h-4 w-4" />
              Pick up where you left off
            </span>
            <h2
              id="continue-reading-heading"
              className="mt-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl"
            >
              Continue reading
            </h2>
          </div>
          <Link
            href="/dashboard/bookmarks"
            className="hidden text-sm font-medium text-muted-foreground transition hover:text-foreground sm:block"
          >
            Your library
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
          {items.map((item) => (
            <Link
              key={item.blogId}
              href={`/blog/${item.slug}`}
              className="group snap-start shrink-0 w-[220px] overflow-hidden rounded-2xl border border-border/50 bg-card transition hover:border-neon-cyan/40"
            >
              <div className="relative aspect-[16/10] bg-muted">
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt=""
                    fill
                    sizes="220px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    unoptimized={shouldSkipImageOptimization(item.coverImage)}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Article
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
                  <div
                    className="h-full bg-neon-cyan"
                    style={{ width: `${Math.min(100, Math.max(4, item.progress))}%` }}
                  />
                </div>
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-neon-cyan">
                  {item.title}
                </h3>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {item.progress}% · resume
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
