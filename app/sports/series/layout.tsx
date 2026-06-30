import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Series",
  description: "Cricket series on ContentVerse Sports Hub.",
  noIndex: true,
});

export default function SeriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
