import { Navbar } from "./navbar";
import { MarketStripWrapper } from "@/components/finance/market-strip-wrapper";
import { HeaderHeightSync } from "@/components/site/header-height-sync";
import { getSiteLogoUrl } from "@/lib/branding/logo";

/** Fixed site header: navbar + live market strip only */
export async function SiteHeader() {
  const logoSrc = await getSiteLogoUrl();

  return (
    <div
      id="site-header"
      className="fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm overflow-x-hidden"
    >
      <HeaderHeightSync />
      <Navbar embedded logoSrc={logoSrc} />
      <MarketStripWrapper />
    </div>
  );
}
