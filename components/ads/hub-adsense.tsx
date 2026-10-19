import { MrecAd } from "@/components/ads/mrec-ad";
import { BandAd } from "@/components/ads/band-ad";
import { cn } from "@/lib/utils";

/**
 * Hub placements — MREC or wide horizontal band.
 * Both collapse when AdSense returns no creative.
 */
export function HubAdSense({
  className,
  variant = "mrec",
}: {
  className?: string;
  variant?: "mrec" | "band";
}) {
  if (variant === "band") {
    return <BandAd slotKey="horizontal" className={className} />;
  }

  return (
    <div
      className={cn("container flex justify-center py-4", className)}
      data-cv-ad-zone="hub-editorial"
    >
      <MrecAd slotKey="hub" />
    </div>
  );
}
