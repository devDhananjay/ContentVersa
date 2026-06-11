"use client";

import { ReelsLibraryStrip } from "@/components/reels/reels-library-strip";
import type { ReelDashboardRow } from "@/lib/reels/types";

interface MyReelsListProps {
  reels: ReelDashboardRow[];
}

export function MyReelsList({ reels }: MyReelsListProps) {
  return <ReelsLibraryStrip reels={reels} title="Your library" />;
}
