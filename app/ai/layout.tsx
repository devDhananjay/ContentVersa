import { DisableAutoAds } from "@/components/ads/disable-auto-ads";

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DisableAutoAds />
      {children}
    </>
  );
}
