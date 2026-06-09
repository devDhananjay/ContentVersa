import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FeedDetailView } from "@/components/feeds/feed-detail-view";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getBlogEngagement } from "@/lib/data/blog-engagement";
import { getFeedItemDetail } from "@/lib/feeds/detail";
import {
  ensureDiscoverBlogInDb,
  getDiscoverSlug,
  parseCommentCountFromMeta,
} from "@/lib/feeds/discover-blog";
import { hasCategoryFeed } from "@/lib/feeds/constants";
import { feedItemPath } from "@/lib/feeds/paths";
import { isDatabaseConfigured } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}): Promise<Metadata> {
  const { category, id } = await params;
  const item = await getFeedItemDetail(category, id);
  if (!item) return buildMetadata({ title: "Not found", noIndex: true });

  return buildMetadata({
    title: item.title,
    description: item.subtitle || item.description || item.title,
    path: feedItemPath(category, id),
    image: item.image,
  });
}

export default async function DiscoverItemPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = await params;
  if (!hasCategoryFeed(category) || category === "finance") notFound();
  if (!getCategoryBySlug(category)) notFound();

  const item = await getFeedItemDetail(category, id);
  if (!item) notFound();

  const discoverSlug = getDiscoverSlug(category, id);
  const blogRef = await ensureDiscoverBlogInDb(item);

  const session = await getCurrentUser();
  const userId = session ? await resolveUserId(session) : null;
  const engagement =
    isDatabaseConfigured() && blogRef
      ? await getBlogEngagement(blogRef.id, userId)
      : null;

  const sourceComments =
    item.stats?.comments ?? parseCommentCountFromMeta(item.meta);

  return (
    <FeedDetailView
      item={item}
      discoverSlug={discoverSlug}
      blogId={blogRef?.id}
      initialReactions={engagement?.totalReactions ?? 0}
      initialComments={sourceComments}
      initialUserReaction={engagement?.userReaction ?? null}
    />
  );
}
