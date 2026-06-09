import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryBySlug } from "@/lib/data/categories";
import type { ReactionTypeKey } from "@/lib/data/blog-engagement";
import type { FeedItemDetail } from "@/lib/feeds/types";
import { FeedArticleEngagement } from "./feed-article-engagement";
import { FeedItemImage } from "./feed-item-image";
import { FeedItemStatsBar } from "./feed-item-stats";

interface FeedDetailViewProps {
  item: FeedItemDetail;
  discoverSlug: string;
  blogId?: string;
  initialReactions?: number;
  initialComments?: number;
  initialUserReaction?: ReactionTypeKey | null;
}

export function FeedDetailView({
  item,
  discoverSlug,
  blogId,
  initialReactions = 0,
  initialComments = 0,
  initialUserReaction = null,
}: FeedDetailViewProps) {
  const category = getCategoryBySlug(item.category);
  const hasImage = Boolean(item.image);

  return (
    <article>
      <div className="container py-6 max-w-4xl">
        <Link
          href={`/blogs?category=${item.category}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {category?.name ?? item.category}
        </Link>

        {hasImage ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border bg-muted mb-8">
            <FeedItemImage
              image={item.image}
              title={item.title}
              category={item.category}
              sizes="(min-width: 896px) 896px, 100vw"
              priority
              iconClassName="h-16 w-16"
            />
          </div>
        ) : null}

        <div>
          {item.stats ? (
            <FeedItemStatsBar stats={item.stats} />
          ) : item.meta ? (
            <Badge variant="outline" className="mb-3">
              {item.meta}
            </Badge>
          ) : null}

          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            {item.title}
          </h1>

          {item.subtitle ? (
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {item.subtitle}
            </p>
          ) : null}

          {item.topics?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {item.topics.map((topic) => (
                <Badge key={topic} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          ) : null}

          {item.description ? (
            <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-base">
                  {item.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
              <p className="text-muted-foreground">
                Full article preview is not available for this story yet.
              </p>
            </div>
          )}

          {item.gallery?.length ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.gallery.map((src) => (
                <div
                  key={src}
                  className="relative aspect-video overflow-hidden rounded-xl border"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(min-width: 768px) 40vw, 100vw"
                  />
                </div>
              ))}
            </div>
          ) : null}

          <FeedArticleEngagement
            discoverSlug={discoverSlug}
            blogId={blogId}
            title={item.title}
            category={item.category}
            initialReactions={initialReactions}
            initialComments={initialComments}
            initialUserReaction={initialUserReaction}
          />

          <div className="mt-10">
            <Link href={`/blogs?category=${item.category}`}>
              <Button variant="gradient">
                More {category?.name ?? item.category} stories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
