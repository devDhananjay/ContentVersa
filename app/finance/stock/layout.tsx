import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Stock quote",
  description: "Live stock price and chart on ContentVerse Finance Hub.",
  noIndex: true,
});

export default function StockLayout({ children }: { children: React.ReactNode }) {
  return children;
}
