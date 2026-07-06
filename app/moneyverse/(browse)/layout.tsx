import { MoneyVerseBrowseShell } from "@/components/moneyverse/moneyverse-browse-shell";

export default function MoneyVerseBrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MoneyVerseBrowseShell>{children}</MoneyVerseBrowseShell>;
}
