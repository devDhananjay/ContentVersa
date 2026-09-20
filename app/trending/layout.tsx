import { DisableAutoAds } from "@/components/ads/disable-auto-ads";

export default function TrendingLayout({
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
