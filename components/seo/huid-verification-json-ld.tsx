import {
  huidVerificationBreadcrumbJsonLd,
  huidVerificationFaqJsonLd,
  huidVerificationWebAppJsonLd,
} from "@/lib/jewellers/huid-seo";

export function HuidVerificationJsonLd() {
  const blocks = [
    huidVerificationWebAppJsonLd(),
    huidVerificationFaqJsonLd(),
    huidVerificationBreadcrumbJsonLd(),
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
