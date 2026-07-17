import type { Metadata } from "next";
import { FileSearch } from "lucide-react";
import { BankStatementAnalyzer } from "@/components/moneyverse/bank-statement-analyzer";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Free Bank Statement Analyzer India — AI Expense & Cash Flow",
  description:
    "Upload an Indian bank statement PDF or image. AI extracts credits, debits, categories, recurring payments, bank charges and cash-flow summary. 5 free analyses per user.",
  path: "/moneyverse/bank-statement-analyzer",
  keywords: [
    "bank statement analyzer india",
    "bank statement analysis online",
    "AI bank statement analyzer",
    "bank statement expense analyzer",
    "PDF bank statement to CSV",
  ],
});

export default function BankStatementAnalyzerPage() {
  return (
    <div className="space-y-8">
      <header className="max-w-3xl space-y-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <FileSearch className="h-3.5 w-3.5" />
          AI · MoneyVerse · Private
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Bank Statement Analyzer
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          Upload a bank statement PDF or image to extract transactions, understand credits and
          debits, find top expense categories, recurring payments and bank charges, and download
          transactions as CSV.
        </p>
        <p className="text-xs text-muted-foreground">
          5 analyses per user · Admin accounts unlimited · Results are informational, not financial
          advice.
        </p>
      </header>

      <BankStatementAnalyzer />
    </div>
  );
}
