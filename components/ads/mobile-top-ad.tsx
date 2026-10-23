import { GoogleAdSense } from "@/components/ads/google-adsense";
import { cn } from "@/lib/utils";

/**
 * Mobile article masthead — 320×50 (YourStory-style). Hidden on lg+.
 */
export function MobileTopAd({
  className,
  slotKey = "horizontal",
}: {
  className?: string;
  slotKey?: "sidebar" | "hub" | "horizontal" | "inArticle";
}) {
  return (
    <aside
      aria-label="Advertisement"
      data-cv-ad-zone="mobile-top"
      className={cn(
        "mx-auto my-3 flex w-full max-w-[320px] flex-col items-center lg:hidden",
        className
      )}
    >
      <p className="mb-1 text-center text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
        Ad
      </p>
      <GoogleAdSense slotKey={slotKey} width={320} height={50} lazy={false} />
    </aside>
  );
}
