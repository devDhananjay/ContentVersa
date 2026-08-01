import type { Metadata } from "next";
import Link from "next/link";
import { MoneyVerseHub } from "@/components/moneyverse/moneyverse-hub";
import { MoneyTopicsGrid } from "@/components/finance/money-topics-grid";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "MoneyVerse — Expense Tracker, Budget Planner & Screenshot OCR India",
  description:
    "Track UPI expenses, plan monthly budgets, view spending reports and scan payment screenshots with OCR — plus MoneyVerse guides for gold, SIP, FD, loans and tax India.",
  path: "/moneyverse",
  keywords: [
    "expense tracker India",
    "UPI expense manager",
    "budget planner",
    "monthly expense report",
    "credit card reminder",
    "SIP reminder",
    "UPI screenshot OCR",
    "payment screenshot scan",
    "MoneyVerse",
    "gold price today",
    "SIP calculator",
  ],
  image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1600",
});

export default function MoneyVersePage() {
  return (
    <div className="space-y-8">
      <HubEditorialIntro title="MoneyVerse on ContentVerse India">
        <p>
          MoneyVerse is your personal finance hub for everyday Indian spending — log UPI,
          cash and card expenses, set category budgets, and see where your money goes each
          month.
        </p>
        <p>
          Add credit card due dates and SIP reminders so you never miss a payment. Sign in
          for free — your data is saved securely to your account. Use{" "}
          <strong className="text-foreground">Screenshot Scan (OCR)</strong> to upload a UPI
          payment image — OCR reads amount, merchant and category automatically. Explore{" "}
          <Link href="/finance#money-guides" className="text-emerald-300 hover:underline">
            MoneyVerse guides
          </Link>{" "}
          for gold, silver, SIP, mutual funds, stocks, IPO, FD, RD, loans, cards, credit score
          and tax.
        </p>
      </HubEditorialIntro>
      <MoneyVerseHub />
      <MoneyTopicsGrid title="Strengthen your money knowledge" />
    </div>
  );
}
