import { GoogleAdSense } from "@/components/ads/google-adsense";
import { MrecAd } from "@/components/ads/mrec-ad";
import { cn } from "@/lib/utils";

/**
 * YourStory-style desktop right rail: 3× 300×250 + 1× 300×600 half-page.
 * Desktop only (lg+). Keep one sticky parent around this column.
 */
export function StackedRailAd({
  className,
  label = "Advertisement",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <aside
      aria-label={label}
      data-cv-ad-zone="stacked-rail"
      className={cn(
        "hidden w-[300px] max-w-full flex-col items-center gap-4 lg:flex",
        className
      )}
    >
      <MrecAd slotKey="sidebar" className="my-0" />
      <MrecAd slotKey="inArticle" className="my-0" />
      <MrecAd slotKey="hub" className="my-0" />
      <div className="flex w-[300px] max-w-full flex-col items-center">
        <p className="mb-1.5 text-center text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
          Ad
        </p>
        <GoogleAdSense slotKey="sidebar" width={300} height={600} />
      </div>
    </aside>
  );
}
