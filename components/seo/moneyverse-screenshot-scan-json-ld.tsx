import {
  screenshotScanBreadcrumbJsonLd,
  screenshotScanFaqJsonLd,
  screenshotScanWebAppJsonLd,
} from "@/lib/moneyverse/screenshot-scan-seo";

export function MoneyverseScreenshotScanJsonLd() {
  const blocks = [
    screenshotScanWebAppJsonLd(),
    screenshotScanFaqJsonLd(),
    screenshotScanBreadcrumbJsonLd(),
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
