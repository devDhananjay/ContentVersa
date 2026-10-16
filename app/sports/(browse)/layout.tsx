import { DisableAutoAds } from "@/components/ads/disable-auto-ads";
import { SportsBrowseShell } from "@/components/sports/sports-browse-shell";

export default function SportsBrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DisableAutoAds />
      <SportsBrowseShell>{children}</SportsBrowseShell>
    </>
  );
}
