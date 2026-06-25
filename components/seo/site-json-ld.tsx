import { SITE, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

/** Homepage structured data — helps Google show logo, search box, and sitelinks. */
export function SiteJsonLd() {
  const org = organizationJsonLd();
  const site = websiteJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(site) }}
      />
    </>
  );
}

export function siteJsonLdForLayout() {
  return { org: organizationJsonLd(), site: websiteJsonLd(), siteName: SITE.name };
}
