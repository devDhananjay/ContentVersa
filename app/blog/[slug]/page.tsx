import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, Eye, MessageCircle, Heart, BadgeCheck, Coffee } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { Reactions } from "@/components/blog/reactions";
import { TableOfContents } from "@/components/blog/toc";
import { Comments } from "@/components/blog/comments";
import { PollWidget } from "@/components/blog/poll-widget";
import { ShareBar } from "@/components/blog/share-bar";
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
import { formatNumber, getInitials, timeAgo } from "@/lib/utils";
import { buildMetadata, articleJsonLd, SITE } from "@/lib/seo";
import { CATEGORIES } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlugHybrid(slug);
  if (!blog) return buildMetadata({ title: "Not found", noIndex: true });
  return buildMetadata({
    title: blog.title,
    description: blog.excerpt,
    path: `/blog/${blog.slug}`,
    image: blog.coverImage,
    type: "article",
    publishedTime: blog.publishedAt,
    authors: [blog.author.name],
    keywords: blog.tags,
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

  const jsonLd = articleJsonLd({
    title: blog.title,
    description: blog.excerpt,
    url,
    image: blog.coverImage,
    datePublished: blog.publishedAt,
    authorName: blog.author.name,
  });

  const coverUnoptimized =
    blog.coverImage.startsWith("/uploads/") || blog.coverImage.startsWith("data:");

  return (
    <>
      <ReadingProgress />
      <FloatingActions
        blogRef={blog.slug}
        likes={reactionCount}
        initialBookmarked={engagement?.bookmarked}
        initialUserReaction={engagement?.userReaction}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="container max-w-5xl py-8 md:py-12">
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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Follow
              </Button>
              <ShareBar url={url} title={blog.title} />
            </div>
          </div>
        </header>

        {blog.coverImage && (
          <div className="relative aspect-[16/9] mb-10 overflow-hidden rounded-3xl">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              priority
              sizes="(min-width: 1280px) 1024px, 100vw"
              className="object-cover"
              unoptimized={coverUnoptimized}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12">
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

            <div className="mt-8 rounded-3xl border-gradient bg-card p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <Avatar className="h-16 w-16 border-2 border-border">
                  <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
                  <AvatarFallback>{getInitials(blog.author.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm uppercase tracking-widest text-muted-foreground mb-1">
                    Liked this piece?
                  </p>
                  <h3 className="font-display text-2xl font-bold">
                    Tip {blog.author.name.split(" ")[0]} for the work
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    100% goes to the creator. Send a one-time tip and back the writing you love.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {[2, 5, 10].map((amount) => (
                    <Button key={amount} variant="outline">
                      ${amount}
                    </Button>
                  ))}
                  <Button variant="gradient" className="gap-2">
                    <Coffee className="h-4 w-4" /> Tip
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 rounded-3xl border bg-card flex flex-col md:flex-row items-start gap-4">
              <Avatar className="h-14 w-14 border-2 border-border">
                <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
                <AvatarFallback>{getInitials(blog.author.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-display text-lg font-bold">{blog.author.name}</p>
                  {blog.author.verified && (
                    <BadgeCheck className="h-4 w-4 text-neon-cyan" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(blog.author.followers)} followers · {blog.author.blogs} blogs
                </p>
                <p className="mt-2 text-sm text-foreground/90">{blog.author.bio}</p>
              </div>
              <Button variant="gradient">Follow</Button>
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
              />
            </div>

            <div id="comments" className="mt-14">
              <h2 className="font-display text-2xl font-bold mb-6">Discussion</h2>
              <Comments blogSlug={slug} initialCount={blog.comments} />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <TableOfContents items={toc} />
            </div>
          </aside>
        </div>

        <Suspense fallback={null}>
          <RecommendedBlogs slug={slug} />
        </Suspense>
      </article>
    </>
  );
}
