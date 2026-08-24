import { GoogleAdSense } from "@/components/ads/google-adsense";

/**
 * Hub placements only — under editorial intros, never beside nav, CTAs,
 * calculator forms, or tool inputs (AdSense UX / invalid click risk).
 */
export function HubAdSense({ className }: { className?: string }) {
  return (
    <div className={className ?? "container my-8"} data-cv-ad-zone="hub-editorial">
      <GoogleAdSense
        slotKey="hub"
        format="horizontal"
        className="mx-auto max-w-3xl"
      />
    </div>
  );
}
