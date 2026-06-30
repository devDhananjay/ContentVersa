import { getPublishedReelsFeedCached } from "@/lib/reels/data";
import { ReelsFeedViewer } from "@/components/reels/reels-feed-viewer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Reels",
  description: "Watch short videos and images from creators on ContentVerse.",
  path: "/reels",
  noIndex: true,
});

export default async function ReelsPage() {
  const { reels } = await getPublishedReelsFeedCached();
  return <ReelsFeedViewer initialReels={reels} immersive />;
}
