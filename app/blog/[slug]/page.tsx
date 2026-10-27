import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Clock, Eye, MessageCircle, Heart, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AuthorActions } from "@/components/blog/author-actions";
import { TipCreator } from "@/components/blog/tip-creator";
import { FollowButton } from "@/components/profile/follow-button";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { Reactions } from "@/components/blog/reactions";
import { TableOfContents } from "@/components/blog/toc";
import { Comments } from "@/components/blog/comments";
import { PollWidget } from "@/components/blog/poll-widget";
import { ShareBar } from "@/components/blog/share-bar";
import { ReportContentButton } from "@/components/blog/report-content";
import { FloatingActions } from "@/components/blog/floating-actions";
import { NewsIn60Short } from "@/components/blog/news-in-60-short";
import { ArticleFeedback } from "@/components/blog/article-feedback";
import { RecommendedBlogs } from "@/components/blog/recommended-blogs";
import { MultiplexAd } from "@/components/ads/multiplex-ad";
import { TrackBlogRead } from "@/components/blog/track-reading";
import { renderMarkdown, extractTOC } from "@/components/blog/markdown";
import { getBlogBySlugForViewer } from "@/lib/data/blog-db";
import { getBlogEngagement } from "@/lib/data/blog-engagement";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { isDatabaseConfigured } from "@/lib/prisma";
import { shouldSkipImageOptimization } from "@/lib/upload";
import {
  formatNumber,
  getInitials,
  formatIstDateTime,
  timeAgo,
} from "@/lib/utils";
import { buildMetadata, articleJsonLd, SITE } from "@/lib/seo";
import { isDiscoverSyndicatedSlug } from "@/lib/feeds/discover-blog";
import { isIndexableArticle } from "@/lib/seo/crawl-policy";
import { redirectTargetFromCanonical } from "@/lib/seo/content-redirects";
import { CATEGORIES } from "@/lib/data/categories";
import { resolveBlogCoverImage } from "@/lib/upload";
import { CoverBrandBadge } from "@/components/media/cover-brand-badge";
import { isContentVerseBrandCover } from "@/lib/seo/toi-cover-url";
import { SeriesNav } from "@/components/blog/series-nav";
import { AdSlot } from "@/components/ads/ad-slot";
import { GoogleAdSense } from "@/components/ads/google-adsense";
import { MobileTopAd } from "@/components/ads/mobile-top-ad";
import { StackedRailAd } from "@/components/ads/stacked-rail-ad";
import { StickyWhatsAppShare } from "@/components/blog/sticky-whatsapp-share";
import {
  YmylDisclaimer,
  ymylKindForBlogCategory,
} from "@/components/seo/ymyl-disclaimer";
import { blogAdSlots, getAdDensity } from "@/lib/ads/density";
import { getBlogSeriesMeta } from "@/lib/data/series";
import { PageBack } from "@/components/site/page-back";
import { dedupeBriefingParagraphs } from "@/lib/seo/toi-news-rewrite";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { resolveLocalizedBlog } from "@/lib/i18n/blog-translations";
import { buildHreflangAlternates } from "@/lib/i18n/hreflang";
import { withLocalePrefix } from "@/lib/i18n/config";
import { LocaleFallbackBanner } from "@/components/i18n/locale-fallback-banner";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const session = await getCurrentUser();
  const userId = session ? await resolveUserId(session) : null;
  const blog = await getBlogBySlugForViewer(slug, userId);
  if (!blog) return buildMetadata({ title: "Not found", noIndex: true });
  if (blog.status === "ARCHIVED" && blog.canonicalUrl?.trim()) {
    return buildMetadata({
      title: blog.title,
      canonicalUrl: blog.canonicalUrl.trim(),
      noIndex: true,
    });
  }
  const localized = await resolveLocalizedBlog(
    {
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt ?? null,
      content: blog.content,
      metaTitle: blog.metaTitle ?? null,
      metaDescription: blog.metaDescription ?? null,
      metaKeywords: blog.metaKeywords,
      category: blog.category ? { slug: blog.category } : null,
    },
    locale
  );
  const isPublic = blog.status === "PUBLISHED";
  const syndicated = isDiscoverSyndicatedSlug(blog.slug);
  const thin = !isIndexableArticle({
    slug: blog.slug,
    readingTime: blog.readingTime,
    metaKeywords: blog.metaKeywords,
  });
  const keywordList = [
    ...(blog.metaKeywords
      ? blog.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean)
      : []),
    ...blog.tags,
  ];
  // True only when a published Hindi BlogTranslation exists (not soft EN fallback).
  const hasPublishedHi =
    locale === "hi"
      ? !localized.usedFallback && localized.locale === "hi"
      : false;

  // For EN requests we still need to know if HI exists for hreflang pairing.
  let hiPublishedForHreflang = hasPublishedHi;
  if (locale === "en" && isDatabaseConfigured() && blog.id) {
    const { getBlogTranslation } = await import("@/lib/i18n/blog-translations");
    const hi = await getBlogTranslation(blog.id, "hi");
    hiPublishedForHreflang = hi?.status === "PUBLISHED";
  }

  const enPath = `/blog/${blog.slug}`;
  // Free / missing HI: canonical stays EN (avoid duplicate /hi soft-fallback in index).
  const path =
    locale === "hi" && !hasPublishedHi
      ? enPath
      : withLocalePrefix(enPath, locale);
  const languages = buildHreflangAlternates(enPath, {
    includeHi: hiPublishedForHreflang,
  }).languages;

  return buildMetadata({
    title: isPublic
      ? localized.metaTitle?.trim() || localized.title
      : `${localized.metaTitle?.trim() || localized.title} (Preview)`,
    description: localized.metaDescription?.trim() || localized.excerpt || undefined,
    path,
    canonicalUrl: blog.canonicalUrl?.trim() || undefined,
    image: resolveBlogCoverImage(blog.coverImage),
    type: "article",
    publishedTime: blog.publishedAt,
    modifiedTime: blog.updatedAt || blog.publishedAt,
    authors: [blog.author.name],
    keywords: keywordList.length ? keywordList : blog.tags,
    noIndex:
      !isPublic ||
      syndicated ||
      thin ||
      (locale === "hi" && !hasPublishedHi),
    alternates: { languages },
  });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const session = await getCurrentUser();
  const userId = session ? await resolveUserId(session) : null;
  const blog = await getBlogBySlugForViewer(slug, userId);
  if (!blog) return notFound();
  if (blog.status === "ARCHIVED" && blog.canonicalUrl?.trim()) {
    permanentRedirect(redirectTargetFromCanonical(blog.canonicalUrl));
  }

  const localized = await resolveLocalizedBlog(
    {
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt ?? null,
      content: blog.content,
      metaTitle: blog.metaTitle ?? null,
      metaDescription: blog.metaDescription ?? null,
      metaKeywords: blog.metaKeywords,
      category: blog.category ? { slug: blog.category } : null,
    },
    locale
  );

  const isPublic = blog.status === "PUBLISHED";
  const category = CATEGORIES.find((c) => c.slug === blog.category);
  const isToiBriefing = Boolean(blog.metaKeywords?.includes("toi-rewrite"));
  const rawBody = localized.content;
  const bodyContent = isToiBriefing
    ? dedupeBriefingParagraphs(rawBody)
    : rawBody;
  const toc = extractTOC(bodyContent);
  const url = `${SITE.url}${withLocalePrefix(`/blog/${blog.slug}`, locale)}`;

  const engagement =
    isPublic && isDatabaseConfigured() && blog.id
      ? await getBlogEngagement(blog.id, userId)
      : null;

  const reactionCount = engagement?.totalReactions ?? blog.likes;
  const syndicated = isDiscoverSyndicatedSlug(blog.slug);
  const isOwnArticle =
    Boolean(userId && blog.author.id && userId === blog.author.id) ||
    Boolean(session?.username && session.username === blog.author.username);
  // Live News briefings always monetize when published (Ads on full story).
  const showAds =
    isPublic && (Boolean(blog.adEligible) || isToiBriefing);
  const adSlots = blogAdSlots(getAdDensity());
  const ymylKind = ymylKindForBlogCategory(blog.category);

  const thinArticle = !isIndexableArticle({
    slug: blog.slug,
    readingTime: blog.readingTime,
    metaKeywords: blog.metaKeywords,
  });
  const jsonLd =
    !isPublic || syndicated || thinArticle
      ? null
      : articleJsonLd({
          title: localized.title,
          description: localized.excerpt || blog.excerpt,
          url,
          image: resolveBlogCoverImage(blog.coverImage),
          datePublished: blog.publishedAt,
          dateModified: blog.updatedAt || blog.publishedAt,
          authorName: blog.author.name,
          authorUrl: `${SITE.url}/profile/${blog.author.username}`,
          type: isToiBriefing ? "NewsArticle" : "Article",
        });

  const coverSrc = resolveBlogCoverImage(
    blog.coverImage ||
      CATEGORIES.find((c) => c.slug === blog.category)?.banner
  );

  const seriesMeta =
    blog.id && isDatabaseConfigured()
      ? await getBlogSeriesMeta(blog.id)
      : null;

  return (
    <>
      <ReadingProgress />
      {isPublic ? (
        <FloatingActions
          blogRef={blog.slug}
          likes={reactionCount}
          initialBookmarked={engagement?.bookmarked}
          initialUserReaction={engagement?.userReaction}
        />
      ) : null}
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}

      <article className="container max-w-5xl py-8 md:py-12">
        <PageBack
          href={isToiBriefing ? "/news" : category ? `/category/${category.slug}` : "/blogs"}
          label={
            isToiBriefing
              ? t(dict, "nav.liveNews")
              : category
                ? t(dict, `categories.${category.slug}`, category.name)
                : t(dict, "footer.blogs")
          }
          className="mb-6"
        />
        {!isPublic ? (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                {blog.status === "DRAFT"
                  ? "Draft preview — only you can see this"
                  : blog.status === "PENDING"
                    ? "Pending review — only you can see this"
                    : blog.status === "REJECTED"
                      ? "Rejected — only you can see this"
                      : "Private preview — only you can see this"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Not public yet. Edit and submit when you are ready.
              </p>
            </div>
            {blog.id ? (
              <Link
                href={`/dashboard/blogs/${blog.id}/edit`}
                className="shrink-0 text-sm font-medium text-amber-800 dark:text-amber-200 underline underline-offset-2"
              >
                Edit blog
              </Link>
            ) : null}
          </div>
        ) : null}
        {seriesMeta ? (
          <SeriesNav
            seriesSlug={seriesMeta.seriesSlug}
            currentPart={seriesMeta.currentPart}
            parts={seriesMeta.parts}
          />
        ) : null}
        <LocaleFallbackBanner
          locale={locale}
          usedFallback={localized.usedFallback}
          translationStatus={localized.translationStatus}
          slug={blog.slug}
        />
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {!isPublic ? (
              <Badge variant="warning">{blog.status}</Badge>
            ) : null}
            {category && (
              <Link href={`/category/${category.slug}`}>
                <Badge variant="gradient" className="shadow-lg">
                  {category.name}
                </Badge>
              </Link>
            )}
            <Badge variant="outline" className="gap-1 font-medium">
              <Clock className="h-3 w-3" />
              {blog.readingTime} min read
            </Badge>
            {blog.premium && <Badge variant="orange">Premium</Badge>}
            {blog.trending && <Badge variant="pink">🔥 Trending</Badge>}
            {blog.editorPick && <Badge variant="neon">Editor&apos;s Pick</Badge>}
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-semibold tracking-[-0.01em] leading-[1.2]">
            {localized.title}
          </h1>
          {localized.excerpt && (
            <p className="mt-5 text-xl text-muted-foreground max-w-3xl">
              {localized.excerpt}
            </p>
          )}

          {/* Byline + IST date/time sit between headline and body (Google News guidance). */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b pb-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-border">
                <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
                <AvatarFallback>{getInitials(blog.author.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">By</span>
                  <Link
                    href={`/profile/${blog.author.username}`}
                    className="font-semibold hover:underline"
                    rel="author"
                  >
                    {blog.author.name}
                  </Link>
                  {blog.author.verified && (
                    <BadgeCheck className="h-4 w-4 text-neon-cyan" />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                  <time dateTime={blog.publishedAt}>
                    Published {formatIstDateTime(blog.publishedAt)}
                  </time>
                  {blog.updatedAt &&
                  new Date(blog.updatedAt).getTime() -
                    new Date(blog.publishedAt).getTime() >
                    60_000 ? (
                    <>
                      <span aria-hidden>·</span>
                      <time dateTime={blog.updatedAt}>
                        Updated {formatIstDateTime(blog.updatedAt)}
                      </time>
                    </>
                  ) : null}
                  <span
                    className="text-muted-foreground/80"
                    title={timeAgo(blog.publishedAt)}
                  >
                    ({timeAgo(blog.publishedAt)})
                  </span>
                  <span aria-hidden>·</span>
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">{blog.readingTime} min read</span>
                  <span aria-hidden>·</span>
                  <Eye className="h-3 w-3" /> {formatNumber(blog.views)}
                  <span aria-hidden>·</span>
                  <Heart className="h-3 w-3" /> {formatNumber(blog.likes)}
                  <span aria-hidden>·</span>
                  <MessageCircle className="h-3 w-3" />{" "}
                  {formatNumber(blog.comments)}
                </p>
                {blog.author.bio ? (
                  <p className="mt-1 line-clamp-2 max-w-md text-xs text-muted-foreground">
                    {blog.author.bio}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!isOwnArticle ? (
                <FollowButton
                  username={blog.author.username}
                  targetUserId={blog.author.id}
                  initialFollowerCount={blog.author.followers}
                />
              ) : null}
              <ShareBar url={url} title={localized.title} imageUrl={blog.coverImage} />
              {blog.id && !isOwnArticle && (
                <ReportContentButton targetType="BLOG" targetId={blog.id} />
              )}
            </div>
          </div>

          {isPublic ? <TrackBlogRead blogSlug={slug} /> : null}

          <div className="mt-6">
            <NewsIn60Short
              blogSlug={slug}
              headline={blog.title}
              coverImage={blog.coverImage}
              authorName={blog.author.name}
              publishedAt={blog.publishedAt}
              content={bodyContent}
              excerpt={blog.excerpt}
              category={blog.category}
            />
          </div>
        </header>

        {coverSrc && (
          <div className="relative aspect-[16/9] mb-10 overflow-hidden rounded-3xl">
            <Image
              src={coverSrc}
              alt={blog.title}
              fill
              priority
              sizes="(min-width: 1280px) 1024px, 100vw"
              className="object-cover"
              unoptimized={shouldSkipImageOptimization(coverSrc)}
            />
            {isToiBriefing && !isContentVerseBrandCover(coverSrc) ? (
              <CoverBrandBadge size="lg" />
            ) : null}
          </div>
        )}

        {showAds && adSlots.mobileTop ? <MobileTopAd /> : null}
        {showAds && adSlots.afterCover ? (
          <AdSlot className="mb-2 mt-0 hidden lg:block" variant="mrec">
            <GoogleAdSense slotKey="inArticle" width={300} height={250} />
          </AdSlot>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10 xl:gap-12 items-start">
          <div>
            {ymylKind ? (
              <YmylDisclaimer kind={ymylKind} className="mb-6 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-muted-foreground" />
            ) : null}
            <h2 className="font-display text-2xl font-bold mb-6">Full story</h2>
            {(() => {
              const parts = bodyContent.split(/\n\n+/);
              if (!showAds || !adSlots.midArticle || parts.length < 4) {
                return renderMarkdown(bodyContent);
              }

              // Desktop: one mid ~40%. Mobile: YourStory-style extras at ~20/40/60/80%.
              const breaks: { fraction: number; mobileOnly: boolean }[] =
                adSlots.mobileExtraMids
                  ? [
                      { fraction: 0.2, mobileOnly: true },
                      { fraction: 0.4, mobileOnly: false },
                      { fraction: 0.6, mobileOnly: true },
                      { fraction: 0.8, mobileOnly: true },
                    ]
                  : [{ fraction: 0.4, mobileOnly: false }];

              const indices = breaks
                .map((b) => ({
                  ...b,
                  index: Math.max(2, Math.min(parts.length - 2, Math.floor(parts.length * b.fraction))),
                }))
                .filter((b, i, arr) => arr.findIndex((x) => x.index === b.index) === i)
                .sort((a, b) => a.index - b.index);

              const nodes: ReactNode[] = [];
              let cursor = 0;
              indices.forEach((b, i) => {
                const chunk = parts.slice(cursor, b.index).join("\n\n");
                if (chunk) nodes.push(<div key={`body-${i}`}>{renderMarkdown(chunk)}</div>);
                nodes.push(
                  <AdSlot
                    key={`ad-${i}`}
                    variant="mrec"
                    className={b.mobileOnly ? "lg:hidden" : undefined}
                  >
                    <GoogleAdSense slotKey="inArticle" width={300} height={250} />
                  </AdSlot>
                );
                cursor = b.index;
              });
              const rest = parts.slice(cursor).join("\n\n");
              if (rest) nodes.push(<div key="body-end">{renderMarkdown(rest)}</div>);
              return <>{nodes}</>;
            })()}

            <div className="mt-10 flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blogs?tag=${tag}`}
                  className="text-xs rounded-full border border-border/60 px-3 py-1.5 hover:border-neon-purple/60 text-muted-foreground hover:text-foreground transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <Reactions
                blogRef={blog.slug}
                initialCount={reactionCount}
                initialUserReaction={engagement?.userReaction}
              />
            </div>

            {/* End-of-article unit — after engagement, before tip/comments */}
            {showAds && adSlots.afterContent ? (
              <AdSlot variant="mrec">
                <GoogleAdSense slotKey="horizontal" width={300} height={250} />
              </AdSlot>
            ) : null}

            <div className="mt-8">
              <ArticleFeedback blogSlug={slug} />
            </div>

            {!isOwnArticle && (
              <div className="mt-8">
                <TipCreator
                  blogSlug={blog.slug}
                  authorName={blog.author.name}
                  authorAvatar={blog.author.avatar}
                />
              </div>
            )}

            <div className="mt-10 p-6 rounded-3xl border bg-card">
              <AuthorActions
                id={blog.author.id}
                name={blog.author.name}
                username={blog.author.username}
                avatar={blog.author.avatar}
                verified={blog.author.verified}
                bio={blog.author.bio}
                followers={blog.author.followers}
                blogs={blog.author.blogs}
                layout="card"
                avatarSize="lg"
                showFollow={!isOwnArticle}
                publishedLabel={formatIstDateTime(blog.publishedAt)}
                updatedLabel={
                  blog.updatedAt &&
                  new Date(blog.updatedAt).getTime() -
                    new Date(blog.publishedAt).getTime() >
                    60_000
                    ? formatIstDateTime(blog.updatedAt)
                    : undefined
                }
              />
            </div>

            <div className="mt-14">
              <PollWidget
                className="mb-10"
                blogContext={{
                  blogSlug: blog.slug,
                  blogId: blog.id,
                  title: blog.title,
                  category: blog.category,
                  tags: blog.tags,
                  excerpt: blog.excerpt,
                }}
                author={
                  isOwnArticle
                    ? undefined
                    : {
                        id: blog.author.id,
                        name: blog.author.name,
                        username: blog.author.username,
                        avatar: blog.author.avatar,
                        verified: blog.author.verified,
                        followers: blog.author.followers,
                      }
                }
              />
            </div>

            <div id="comments" className="mt-14">
              <h2 className="font-display text-2xl font-bold mb-6">Discussion</h2>
              <Comments blogSlug={slug} initialCount={blog.comments} />
            </div>
          </div>

          {/*
            Do not use overscroll-y-contain here — it traps wheel/trackpad scroll in the
            sticky TOC column so readers get stuck mid-article on desktop.
          */}
          <aside className="hidden lg:block lg:sticky lg:top-[calc(var(--site-header-offset)+1rem)] lg:self-start max-h-[calc(100dvh-var(--site-header-offset)-2rem)] overflow-y-auto scrollbar-hide space-y-5">
            <TableOfContents items={toc} />
            {showAds && adSlots.stackedRail ? (
              <StackedRailAd className="pt-2" />
            ) : showAds && adSlots.sidebar ? (
              <div className="space-y-2 pt-2">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
                  Advertisement
                </p>
                <GoogleAdSense slotKey="sidebar" width={160} height={600} />
              </div>
            ) : null}
          </aside>
        </div>

        {isPublic ? (
          <StickyWhatsAppShare url={url} title={localized.title} />
        ) : null}

        <Suspense fallback={null}>
          <RecommendedBlogs slug={slug} />
        </Suspense>
        {showAds ? <MultiplexAd /> : null}
      </article>
    </>
  );
}
