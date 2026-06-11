import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { getPublishedReelsStripCached, getViewedReelIds } from "@/lib/reels/data";
import { ReelsStripCarousel } from "@/components/reels/reels-strip-carousel";

export async function ReelsStripWrapper() {
  const { reels } = await getPublishedReelsStripCached();

  let viewedReelIds: string[] = [];
  const session = await getCurrentUser();
  if (session && reels.length > 0) {
    const userId = await resolveUserId(session);
    if (userId) {
      viewedReelIds = await getViewedReelIds(
        reels.map((r) => r.id),
        { userId }
      );
    }
  }

  return <ReelsStripCarousel reels={reels} viewedReelIds={viewedReelIds} />;
}
