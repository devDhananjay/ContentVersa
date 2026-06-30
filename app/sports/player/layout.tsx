import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Player",
  description: "Cricket player profile on ContentVerse Sports Hub.",
  noIndex: true,
});

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
