import {
  SITE,
  organizationJsonLd,
  websiteJsonLd,
  siteNavigationJsonLd,
  platformModulesJsonLd,
} from "@/lib/seo";

/** Homepage structured data — logo, search box, navigation & sitelink hints. */
export function SiteJsonLd() {
  const blocks = [
    organizationJsonLd(),
    websiteJsonLd(),
    siteNavigationJsonLd(),
    platformModulesJsonLd(),
  ];

  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}

export function siteJsonLdForLayout() {
  return { org: organizationJsonLd(), site: websiteJsonLd(), siteName: SITE.name };
}
