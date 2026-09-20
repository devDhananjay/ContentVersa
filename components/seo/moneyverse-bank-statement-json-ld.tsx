import {
  bankStatementBreadcrumbJsonLd,
  bankStatementFaqJsonLd,
  bankStatementWebAppJsonLd,
} from "@/lib/moneyverse/bank-statement-seo";

export function MoneyverseBankStatementJsonLd() {
  const blocks = [
    bankStatementWebAppJsonLd(),
    bankStatementFaqJsonLd(),
    bankStatementBreadcrumbJsonLd(),
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
