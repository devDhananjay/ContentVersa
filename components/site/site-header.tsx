import { Navbar } from "./navbar";
import { MarketStripWrapper } from "@/components/finance/market-strip-wrapper";

/** Fixed site header: navbar + live market strip as one unit */
export function SiteHeader() {
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <Navbar embedded />
      <MarketStripWrapper />
    </div>
  );
}
