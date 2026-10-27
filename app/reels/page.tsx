import { getPublishedReelsFeedCached } from "@/lib/reels/data";
import { ReelsFeedViewer } from "@/components/reels/reels-feed-viewer";
import type { Metadata } from "next";
import { buildLocaleHubMetadata } from "@/lib/i18n/locale-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocaleHubMetadata({
    path: "/reels",
    titleEn: "Reels — Short Videos from Indian Creators",
    titleHi: "Reels — Short Videos from Indian Creators",
    descriptionEn:
      "Watch short-form videos and creator reels on ContentVerse India. Discover trending clips from writers and creators.",
    descriptionHi:
      "Watch short-form videos and creator reels on ContentVerse India. Discover trending clips from writers and creators.",
    noIndex: true,
    bilingualIndex: false,
  });
}

export default async function ReelsPage() {
  const { reels } = await getPublishedReelsFeedCached();
  return <ReelsFeedViewer initialReels={reels} immersive />;
}
