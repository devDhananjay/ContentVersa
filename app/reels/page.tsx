import { getPublishedReelsFeedCached } from "@/lib/reels/data";
import { ReelsFeedViewer } from "@/components/reels/reels-feed-viewer";

export const metadata = {
  title: "Reels | ContentVerse",
  description: "Watch short videos and images from creators on ContentVerse.",
};

export default async function ReelsPage() {
  const { reels } = await getPublishedReelsFeedCached();
  return <ReelsFeedViewer initialReels={reels} immersive />;
}
