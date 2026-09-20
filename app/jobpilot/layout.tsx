import type { Metadata } from "next";
import { DisableAutoAds } from "@/components/ads/disable-auto-ads";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "ContentVerse HirePilot",
  description: "Find jobs. Understand jobs. Apply smarter.",
  path: "/jobpilot",
  // Resume / apply tool — noindex + no auto ads until AdSense approval.
  noIndex: true,
});

export default function JobPilotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DisableAutoAds />
      {children}
    </>
  );
}
