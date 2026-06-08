import { FinanceBrowseShell } from "@/components/finance/finance-browse-shell";

export default function FinanceBrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FinanceBrowseShell>{children}</FinanceBrowseShell>;
}
