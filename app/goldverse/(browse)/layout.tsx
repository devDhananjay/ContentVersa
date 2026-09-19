import { GoldVerseBrowseShell } from "@/components/goldverse/goldverse-browse-shell";
import { DisableAutoAds } from "@/components/ads/disable-auto-ads";

export default function GoldVerseBrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DisableAutoAds />
      <GoldVerseBrowseShell>{children}</GoldVerseBrowseShell>
    </>
  );
}
