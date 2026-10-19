import type { Metadata } from "next";
import { DisableAutoAds } from "@/components/ads/disable-auto-ads";
import { ThemePreview } from "@/components/theme-preview/theme-preview";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Theme preview",
  description: "Internal design preview — not part of the public site.",
  path: "/theme-preview",
  noIndex: true,
});

export default function ThemePreviewPage() {
  return (
    <div className="container max-w-[1500px] py-8 md:py-10">
      <DisableAutoAds />
      <ThemePreview />
    </div>
  );
}
