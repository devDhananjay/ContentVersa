import { CineverseBrowseShell } from "@/components/cineverse/cineverse-browse-shell";

export default function CineverseBrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CineverseBrowseShell>{children}</CineverseBrowseShell>;
}
