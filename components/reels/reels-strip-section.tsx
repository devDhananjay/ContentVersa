import { Suspense } from "react";
import { ReelsStripWrapper } from "@/components/reels/reels-strip-wrapper";

/** Reels story strip — shown on home + dashboard only. */
export function ReelsStripSection() {
  return (
    <Suspense
      fallback={
        <div className="border-b border-border/40 h-[237px] bg-muted/10 animate-pulse" />
      }
    >
      <ReelsStripWrapper />
    </Suspense>
  );
}
