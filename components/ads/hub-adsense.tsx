import { GoogleAdSense } from "@/components/ads/google-adsense";

/** Safe hub ad — only under editorial intros, reserved height. */
export function HubAdSense({ className }: { className?: string }) {
  return (
    <div className={className ?? "container my-8"}>
      <GoogleAdSense
        slotKey="hub"
        format="horizontal"
        className="mx-auto max-w-3xl"
      />
    </div>
  );
}
