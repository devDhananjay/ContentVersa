import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCricketNewsDetail } from "@/lib/sports/data";
import { buildMetadata } from "@/lib/seo";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getCricketNewsDetail(Number(id));
  if (!article) return buildMetadata({ title: "Cricket News", noIndex: true });
  return buildMetadata({
    title: article.headline,
    description: article.intro,
    path: `/sports/news/${id}`,
    image: article.imageUrl,
    type: "article",
    publishedTime: article.publishedAt,
    noIndex: true,
  });
}

export default async function CricketNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const newsId = Number(id);
  if (!Number.isFinite(newsId)) redirect("/sports");

  const article = await getCricketNewsDetail(newsId);
  if (!article) redirect("/sports");

  return (
    <article className="container py-8 md:py-12 max-w-3xl">
      <Link href="/sports">
        <Button variant="ghost" size="sm" className="gap-2 mb-6 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back to Sports Hub
        </Button>
      </Link>

      {article.context && (
        <Badge variant="neon" className="mb-3">
          {article.context}
        </Badge>
      )}

      <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
        {article.headline}
      </h1>

      <p className="mt-3 text-sm text-muted-foreground">
        {timeAgo(article.publishedAt)}
        {article.source ? ` · ${article.source}` : ""}
      </p>

      {article.imageUrl && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={article.imageUrl}
            alt={article.headline}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="prose prose-neutral dark:prose-invert max-w-none mt-8">
        {article.content.map((para, i) => (
          <p key={i} className="text-base leading-relaxed text-foreground/90 mb-4">
            {para}
          </p>
        ))}
      </div>

      <p className="mt-10 pt-6 border-t text-xs text-muted-foreground">
        Source: Cricbuzz via RapidAPI. For editorial opinion and community
        discussion,{" "}
        <Link href="/category/sports" className="underline hover:text-foreground">
          read sports blogs on ContentVerse
        </Link>
        .
      </p>
    </article>
  );
}
