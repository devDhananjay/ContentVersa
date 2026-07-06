import { JewellersBrowseShell } from "@/components/jewellers/jewellers-browse-shell";

export default function JewellersBrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JewellersBrowseShell>{children}</JewellersBrowseShell>;
}
