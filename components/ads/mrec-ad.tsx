import { GoogleAdSense } from "@/components/ads/google-adsense";
import { cn } from "@/lib/utils";

/** Fixed 300x250 MPU — frame equals the ad (no extra padding). */
export function MrecAd({
  slotKey = "hub",
  className,
  label = "Advertisement",
}: {
  slotKey?: "sidebar" | "hub" | "horizontal" | "inArticle";
  className?: string;
  label?: string;
}) {
  return (
    <aside
      aria-label={label}
      data-cv-ad-zone="mrec"
      className={cn("mx-auto flex w-fit max-w-full flex-col items-center", className)}
    >
      <p className="mb-1.5 text-center text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
        {label === "Advertisement" ? "Ad" : label}
      </p>
      <GoogleAdSense slotKey={slotKey} width={300} height={250} />
    </aside>
  );
}
