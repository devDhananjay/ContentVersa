import { GoldVerseBrowseShell } from "@/components/goldverse/goldverse-browse-shell";

export default function GoldVerseBrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GoldVerseBrowseShell>{children}</GoldVerseBrowseShell>;
}
