import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { getContinueReading } from "@/lib/data/reading-history";
import { getPublishedBlogsLiteHybrid } from "@/lib/data/blog-db";
import { shouldSkipImageOptimization } from "@/lib/upload";
import { getDictionary, t, tf } from "@/lib/i18n/get-dictionary";
import { getRequestLocale } from "@/lib/i18n/locale-server";

type ContinueItem = {
  blogId: string;
  slug: string;
  title: string;
  coverImage: string | null;
  progress: number;
  /** Optional absolute path when the card is not a /blog/[slug] article. */
  href?: string;
};

/** Unfinished articles when history exists; otherwise latest stories so the strip always shows. */
export async function ContinueReadingStrip() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  let userId: string | null = null;
  let visitorKey: string | null = null;

  try {
    const session = await getCurrentUser();
    userId = session ? await resolveUserId(session).catch(() => null) : null;
    const jar = await cookies();
    visitorKey = jar.get("cv_reader")?.value ?? null;
  } catch {
    /* auth/cookies unavailable — still show fallback cards */
  }

  let items: ContinueItem[] = [];
  if (userId || visitorKey) {
    try {
      items = await getContinueReading({ userId, visitorKey }, 8);
    } catch {
      items = [];
    }
  }

  if (!items.length) {
    try {
      const fallback = await getPublishedBlogsLiteHybrid(6);
      items = fallback.map((blog) => ({
        blogId: blog.id,
        slug: blog.slug,
        title: blog.title,
        coverImage: blog.coverImage,
        progress: 0,
      }));
    } catch {
      items = [];
    }
  }

  // Design / offline fallback so the section never disappears from the home page.
  if (!items.length) {
    items = [
      {
        blogId: "demo-sip",
        slug: "sip",
        href: "/guides/money/sip-calculator-india-beginners-guide",
        title: "SIP for beginners — how much to start in India",
        coverImage: null,
        progress: 42,
      },
      {
        blogId: "demo-cibil",
        slug: "cibil",
        href: "/guides/money/credit-score-cibil-india-guide",
        title: "CIBIL / credit score: what actually moves it",
        coverImage: null,
        progress: 18,
      },
      {
        blogId: "demo-huid",
        slug: "huid",
        href: "/guides/money/huid-hallmark-gold-buying-india",
        title: "HUID explained: verify hallmarked gold before you pay",
        coverImage: null,
        progress: 67,
      },
      {
        blogId: "demo-jobs",
        slug: "jobs",
        href: "/guides/jobs",
        title: "How to read a Sarkari job notification without missing dates",
        coverImage: null,
        progress: 0,
      },
    ];
  }

  const hasProgress = items.some((item) => item.progress > 0);

  return (
    <section
      id="continue-reading"
      className="scroll-mt-[calc(var(--site-header-offset)+1rem)] border-y border-border/60 bg-muted/40"
      aria-labelledby="continue-reading-heading"
    >
      <div className="container py-10 md:py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="v2-eyebrow inline-flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {t(dict, "home.continueEyebrow")}
            </p>
            <h2
              id="continue-reading-heading"
              className="mt-1.5 font-display text-2xl font-bold tracking-tight md:text-3xl"
            >
              {t(dict, "home.continueTitle")}
            </h2>
          </div>
          {userId ? (
            <Link
              href="/dashboard/bookmarks"
              className="hidden items-center gap-1 text-sm font-semibold text-muted-foreground transition hover:text-foreground sm:inline-flex"
            >
              {t(dict, "home.continueLibrary")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link
              href="/auth/sign-in?next=/"
              className="hidden items-center gap-1 text-sm font-semibold text-muted-foreground transition hover:text-foreground sm:inline-flex"
            >
              {t(dict, "home.continueSignIn")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
          {items.map((item) => (
            <Link
              key={item.blogId}
              href={item.href ?? `/blog/${item.slug}`}
              className="v2-raised v2-lift group relative w-[220px] shrink-0 snap-start overflow-hidden sm:w-[240px]"
            >
              <div className="relative aspect-[16/10] bg-muted">
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt=""
                    fill
                    sizes="240px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    unoptimized={shouldSkipImageOptimization(item.coverImage)}
                  />
                ) : (
                  <div className="v2-aurora flex h-full items-center justify-center text-xs text-muted-foreground">
                    {t(dict, "home.continueArticle")}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/35">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.min(100, Math.max(hasProgress ? 4 : 0, item.progress))}%`,
                    }}
                  />
                </div>
              </div>
              <div className="p-3.5">
                <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug tracking-tight group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {item.progress > 0
                    ? tf(dict, "home.continueResume", { n: item.progress })
                    : t(dict, "home.continueStart")}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-5 sm:hidden">
          <Link
            href={userId ? "/dashboard/bookmarks" : "/blogs"}
            className="v2-btn-primary inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold"
          >
            {userId ? t(dict, "home.continueLibrary") : t(dict, "home.continueBrowse")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
