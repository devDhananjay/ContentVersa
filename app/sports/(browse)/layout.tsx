import { SportsBrowseShell } from "@/components/sports/sports-browse-shell";

export default function SportsBrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SportsBrowseShell>{children}</SportsBrowseShell>;
}
