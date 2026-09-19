import { DisableAutoAds } from "@/components/ads/disable-auto-ads";

export default function CineverseMovieLayout({
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
