import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";
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
import { TrackBlogRead } from "@/components/blog/track-reading";
import { renderMarkdown, extractTOC } from "@/components/blog/markdown";
import { getBlogBySlugHybrid } from "@/lib/data/blog-db";
import { getBlogEngagement } from "@/lib/data/blog-engagement";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { isDatabaseConfigured } from "@/lib/prisma";
import { shouldSkipImageOptimization } from "@/lib/upload";
import { formatNumber, getInitials, timeAgo } from "@/lib/utils";
import { buildMetadata, articleJsonLd, SITE } from "@/lib/seo";
import { isDiscoverSyndicatedSlug } from "@/lib/feeds/discover-blog";
import { CATEGORIES } from "@/lib/data/categories";
import { resolveBlogCoverImage } from "@/lib/upload";
import { SeriesNav } from "@/components/blog/series-nav";
import { GoogleAdSense } from "@/components/ads/google-adsense";
import { getBlogSeriesMeta } from "@/lib/data/series";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlugHybrid(slug);
  if (!blog) return buildMetadata({ title: "Not found", noIndex: true });
  const syndicated = isDiscoverSyndicatedSlug(blog.slug);
  return buildMetadata({
    title: blog.title,
    description: blog.excerpt,
    path: `/blog/${blog.slug}`,
    image: blog.coverImage,
    type: "article",
    publishedTime: blog.publishedAt,
    authors: [blog.author.name],
    keywords: blog.tags,
    noIndex: syndicated,
  });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlugHybrid(slug);
  if (!blog) return notFound();

  const category = CATEGORIES.find((c) => c.slug === blog.category);
  const toc = extractTOC(blog.content);
  const url = `${SITE.url}/blog/${blog.slug}`;

  const session = await getCurrentUser();
  const userId = session ? await resolveUserId(session) : null;

  const engagement =
    isDatabaseConfigured() && blog.id
      ? await getBlogEngagement(blog.id, userId)
      : null;

  const reactionCount = engagement?.totalReactions ?? blog.likes;
  const syndicated = isDiscoverSyndicatedSlug(blog.slug);
  const isOwnArticle =
    Boolean(userId && blog.author.id && userId === blog.author.id) ||
    Boolean(session?.username && session.username === blog.author.username);

  const jsonLd = syndicated
    ? null
    : articleJsonLd({
        title: blog.title,
        description: blog.excerpt,
        url,
        image: blog.coverImage,
        datePublished: blog.publishedAt,
        authorName: blog.author.name,
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
      <FloatingActions
        blogRef={blog.slug}
        likes={reactionCount}
        initialBookmarked={engagement?.bookmarked}
        initialUserReaction={engagement?.userReaction}
      />
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}

      <article className="container max-w-5xl py-8 md:py-12">
        {seriesMeta ? (
          <SeriesNav
            seriesSlug={seriesMeta.seriesSlug}
            currentPart={seriesMeta.currentPart}
            parts={seriesMeta.parts}
          />
        ) : null}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-5">
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
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            {blog.title}
          </h1>
          {blog.excerpt && (
            <p className="mt-5 text-xl text-muted-foreground max-w-3xl">
              {blog.excerpt}
            </p>
          )}

          <TrackBlogRead blogSlug={slug} />

          <div className="mt-6">
            <NewsIn60Short
              blogSlug={slug}
              headline={blog.title}
              coverImage={blog.coverImage}
              authorName={blog.author.name}
              publishedAt={blog.publishedAt}
              content={blog.content}
              excerpt={blog.excerpt}
              category={blog.category}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pb-6 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-border">
                <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
                <AvatarFallback>{getInitials(blog.author.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/profile/${blog.author.username}`}
                    className="font-semibold hover:underline"
                  >
                    {blog.author.name}
                  </Link>
                  {blog.author.verified && (
                    <BadgeCheck className="h-4 w-4 text-neon-cyan" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  {timeAgo(blog.publishedAt)} ·
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">{blog.readingTime} min read</span>
                  <span className="text-muted-foreground">·</span>
                  <Eye className="h-3 w-3" /> {formatNumber(blog.views)} ·
                  <Heart className="h-3 w-3" /> {formatNumber(blog.likes)} ·
                  <MessageCircle className="h-3 w-3" /> {formatNumber(blog.comments)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <FollowButton
                username={blog.author.username}
                targetUserId={blog.author.id}
                initialFollowerCount={blog.author.followers}
              />
              <ShareBar url={url} title={blog.title} imageUrl={blog.coverImage} />
              {blog.id && !isOwnArticle && (
                <ReportContentButton targetType="BLOG" targetId={blog.id} />
              )}
            </div>
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
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12 items-start">
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Full story</h2>
            {renderMarkdown(blog.content)}

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

            {!isOwnArticle && (
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
                />
              </div>
            )}

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

          <aside className="hidden lg:block lg:sticky lg:top-[calc(var(--site-header-offset)+1rem)] lg:self-start max-h-[calc(100dvh-var(--site-header-offset)-2rem)] overflow-y-auto overscroll-y-contain scrollbar-hide space-y-6">
            <TableOfContents items={toc} />
            <GoogleAdSense format="rectangle" className="rounded-xl overflow-hidden" />
          </aside>
        </div>

        <Suspense fallback={null}>
          <RecommendedBlogs slug={slug} />
        </Suspense>
      </article>
    </>
  );
}
