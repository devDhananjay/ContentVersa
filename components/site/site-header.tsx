import { MarketStripWrapper } from "@/components/finance/market-strip-wrapper";
import { SiteHeaderFrame } from "@/components/site/site-header-frame";
import { getSiteLogoUrl } from "@/lib/branding/site-logo";

/** Fixed site header: navbar + live market strip only */
export async function SiteHeader() {
  const logoSrc = await getSiteLogoUrl();

  return (
    <SiteHeaderFrame logoSrc={logoSrc} marketStrip={<MarketStripWrapper />} />
  );
}
