import { notFound } from "next/navigation";
import {
  getPublishedReelsFeedCached,
  getReelByIdCached,
} from "@/lib/reels/data";
import { ReelsFeedViewer } from "@/components/reels/reels-feed-viewer";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reel = await getReelByIdCached(id);
  if (!reel) return buildMetadata({ title: "Reel not found", noIndex: true });
  return buildMetadata({
    title: `${reel.author.name} on Reels`,
    description: reel.caption.slice(0, 160),
    path: `/reels/${id}`,
    noIndex: true,
  });
}

export default async function ReelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reel = await getReelByIdCached(id);
  if (!reel) notFound();

  const { reels } = await getPublishedReelsFeedCached();
  const feedReels = reels.some((r) => r.id === id) ? reels : [reel, ...reels];

  return <ReelsFeedViewer initialReels={feedReels} startId={id} immersive />;
}
