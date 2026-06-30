import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Match",
  description: "Live cricket match on ContentVerse Sports Hub.",
  noIndex: true,
});

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
