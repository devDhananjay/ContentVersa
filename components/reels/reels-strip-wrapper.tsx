import { getPublishedReelsStripCached } from "@/lib/reels/data";
import { ReelsStripCarousel } from "@/components/reels/reels-strip-carousel";

export async function ReelsStripWrapper() {
  const { reels } = await getPublishedReelsStripCached();
  return <ReelsStripCarousel reels={reels} />;
}
