import { MoneyVerseBrowseShell } from "@/components/moneyverse/moneyverse-browse-shell";
import { DisableAutoAds } from "@/components/ads/disable-auto-ads";

export default function MoneyVerseBrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DisableAutoAds />
      <MoneyVerseBrowseShell>{children}</MoneyVerseBrowseShell>
    </>
  );
}
