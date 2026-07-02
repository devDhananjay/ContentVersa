import { getPublishedReelsFeedCached } from "@/lib/reels/data";
import { ReelsFeedViewer } from "@/components/reels/reels-feed-viewer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Reels — Short Videos from Indian Creators",
  description:
    "Watch short-form videos and creator reels on ContentVerse India. Discover trending clips from writers and creators.",
  path: "/reels",
});

export default async function ReelsPage() {
  const { reels } = await getPublishedReelsFeedCached();
  return <ReelsFeedViewer initialReels={reels} immersive />;
}
