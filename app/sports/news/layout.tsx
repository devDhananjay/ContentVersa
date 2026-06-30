import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cricket news",
  description: "Cricket headline on ContentVerse Sports Hub.",
  noIndex: true,
});

export default function SportsNewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
