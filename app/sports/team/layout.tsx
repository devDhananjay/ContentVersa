import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Team",
  description: "Cricket team profile on ContentVerse Sports Hub.",
  noIndex: true,
});

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
