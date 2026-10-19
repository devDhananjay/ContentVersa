import { GoogleAdSense } from "@/components/ads/google-adsense";
import { cn } from "@/lib/utils";

/**
 * Multiplex (autorelaxed) native grid — use under "Related / Recommended"
 * sections. Keep to one per page.
 */
export function MultiplexAd({ className }: { className?: string }) {
  return (
    <aside
      aria-label="Sponsored recommendations"
      data-cv-ad-zone="multiplex"
      className={cn("mt-8 w-full", className)}
    >
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
        Sponsored
      </p>
      <GoogleAdSense slotKey="multiplex" format="autorelaxed" />
    </aside>
  );
}
