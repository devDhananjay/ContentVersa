import { MrecAd } from "@/components/ads/mrec-ad";
import { cn } from "@/lib/utils";

/** Thin wrapper — no extra card chrome (avoids empty white-looking boxes). */
export function AdCell({
  slotKey = "hub",
  className,
}: {
  slotKey?: "sidebar" | "hub" | "horizontal" | "inArticle";
  className?: string;
  minHeight?: number;
}) {
  return (
    <div className={cn("flex w-full justify-center", className)}>
      <MrecAd slotKey={slotKey} label="Ad" />
    </div>
  );
}
