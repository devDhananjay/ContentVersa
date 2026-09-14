import { DisableAutoAds } from "@/components/ads/disable-auto-ads";

export default function HuidVerificationLayout({
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
