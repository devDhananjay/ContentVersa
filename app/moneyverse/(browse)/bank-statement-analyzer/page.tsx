import type { Metadata } from "next";
import Link from "next/link";
import { FileSearch } from "lucide-react";
import { BankStatementAnalyzer } from "@/components/moneyverse/bank-statement-analyzer";
import { BankStatementGuide } from "@/components/moneyverse/bank-statement-guide";
import { MoneyverseBankStatementJsonLd } from "@/components/seo/moneyverse-bank-statement-json-ld";
import {
  BANK_STATEMENT_EDITORIAL,
  BANK_STATEMENT_KEYWORDS,
  MONEYVERSE_BANK_STATEMENT_PATH,
} from "@/lib/moneyverse/bank-statement-seo";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Free Bank Statement Analyzer India — AI Expense & Cash Flow",
  description:
    "Understand how to review Indian bank statement PDFs safely, then analyse credits, debits, recurring payments and CSV export with MoneyVerse. Educational tool — not a bank product.",
  path: MONEYVERSE_BANK_STATEMENT_PATH,
  keywords: [...BANK_STATEMENT_KEYWORDS],
  // Keep noindex through AdSense review; flip after crawl quality settles.
  noIndex: true,
});

export default function BankStatementAnalyzerPage() {
  const { lead, paragraphs } = BANK_STATEMENT_EDITORIAL;

  return (
    <div className="space-y-10">
      <MoneyverseBankStatementJsonLd />

      <header className="max-w-3xl space-y-4">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <FileSearch className="h-3.5 w-3.5" />
          AI · MoneyVerse · Private
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Bank Statement Analyzer for India
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{lead}</p>
      </header>

      <article className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
        <p>
          One UPI receipt only? Use{" "}
          <Link
            href="/moneyverse/screenshot-scan"
            className="text-emerald-400 hover:underline"
          >
            Screenshot Scan (OCR)
          </Link>{" "}
          or open your{" "}
          <Link href="/moneyverse" className="text-emerald-400 hover:underline">
            MoneyVerse tracker
          </Link>
          .
        </p>
      </article>

      <section id="analyzer-tool" className="space-y-3 scroll-mt-24">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Upload a statement
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          5 analyses per signed-in user · Admin unlimited · Informational only — not tax, loan or
          financial advice. Ads stay off on this upload surface.
        </p>
        <BankStatementAnalyzer />
      </section>

      <BankStatementGuide />
    </div>
  );
}
