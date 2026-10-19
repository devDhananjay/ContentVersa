import { GoogleAdSense } from "@/components/ads/google-adsense";
import { cn } from "@/lib/utils";

const HAS_MULTIPLEX_SLOT = Boolean(
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_MULTIPLEX?.trim()
);

/**
 * Multiplex (autorelaxed) native grid — use under "Related / Recommended"
 * sections. Keep to one per page.
 * Falls back to hub MREC when MULTIPLEX slot env is not baked into the build.
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
      {HAS_MULTIPLEX_SLOT ? (
        <GoogleAdSense slotKey="multiplex" format="autorelaxed" />
      ) : (
        <div className="flex justify-center">
          <GoogleAdSense slotKey="hub" width={300} height={250} />
        </div>
      )}
    </aside>
  );
}