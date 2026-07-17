"use client";

import * as React from "react";
import Link from "next/link";
import { Download, FileSearch, FileUp, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/components/auth/use-session";
import { isAdminRole } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  BankStatementAnalysis,
  BankStatementTransaction,
} from "@/lib/moneyverse/bank-statement-analyzer";

type Quota = {
  used: number;
  limit: number | null;
  remaining: number | null;
  canAnalyze: boolean;
  unlimited: boolean;
  loggedIn: boolean;
};

const EMPTY_QUOTA: Quota = {
  used: 0,
  limit: 5,
  remaining: 0,
  canAnalyze: false,
  unlimited: false,
  loggedIn: false,
};

export function BankStatementAnalyzer() {
  const { isSignedIn, loading: sessionLoading, user } = useSession();
  const adminUnlimited = isAdminRole(user?.role);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [quota, setQuota] = React.useState<Quota>(EMPTY_QUOTA);
  const [quotaLoading, setQuotaLoading] = React.useState(true);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<BankStatementAnalysis | null>(null);

  const loadQuota = React.useCallback(async () => {
    setQuotaLoading(true);
    try {
      const res = await fetch("/api/moneyverse/bank-statement/quota", {
        cache: "no-store",
        credentials: "include",
      });
      const data = (await res.json()) as Quota;
      setQuota(data);
    } catch {
      setQuota(EMPTY_QUOTA);
    } finally {
      setQuotaLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!sessionLoading) void loadQuota();
  }, [loadQuota, sessionLoading]);

  async function analyze() {
    if (!file || analyzing) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const form = new FormData();
      form.append("statement", file);
      const res = await fetch("/api/moneyverse/bank-statement/analyze", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Analysis failed");
        if (data.quota) setQuota((current) => ({ ...current, ...data.quota }));
        if (res.status === 429) void loadQuota();
        return;
      }
      setAnalysis(data.analysis as BankStatementAnalysis);
      if (data.quota) {
        setQuota((current) => ({
          ...current,
          ...data.quota,
          canAnalyze: Boolean(
            data.quota.unlimited || (data.quota.remaining != null && data.quota.remaining > 0)
          ),
        }));
      } else {
        void loadQuota();
      }
      toast.success("Bank statement analyzed");
    } catch {
      toast.error("Upload failed — try again");
    } finally {
      setAnalyzing(false);
    }
  }

  const signedIn = isSignedIn || quota.loggedIn;

  const effectiveQuota = React.useMemo((): Quota => {
    if (adminUnlimited) {
      return {
        ...quota,
        unlimited: true,
        canAnalyze: true,
        limit: null,
        remaining: null,
        loggedIn: true,
      };
    }
    return quota;
  }, [adminUnlimited, quota]);

  if (sessionLoading || quotaLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
        <FileSearch className="mx-auto h-10 w-10 text-emerald-400" />
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in to analyze a bank statement. Every user gets 5 analyses.
        </p>
        <Link href="/auth/sign-in?next=/moneyverse/bank-statement-analyzer">
          <Button className="mt-4 bg-emerald-500 text-black hover:bg-emerald-400">
            Sign in to analyze
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-card to-card">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSearch className="h-5 w-5 text-emerald-400" />
              Upload bank statement
            </CardTitle>
            <span className="rounded-full border border-emerald-500/30 px-3 py-1 text-xs text-emerald-300">
              {effectiveQuota.unlimited
                ? "Admin · Unlimited analyses"
                : `${Math.max(0, effectiveQuota.remaining ?? 0)} of ${effectiveQuota.limit ?? 5} analyses left`}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={analyzing || !effectiveQuota.canAnalyze}
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null;
              if (next && next.size > 10 * 1024 * 1024) {
                toast.error("File must be under 10 MB");
                event.target.value = "";
                return;
              }
              setFile(next);
              setAnalysis(null);
            }}
          />
          <div className="rounded-xl border border-dashed border-border/70 p-5">
            <p className="text-sm font-medium">
              {file ? file.name : "PDF, JPG, PNG or WebP · maximum 10 MB"}
            </p>
            {file ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={analyzing || !effectiveQuota.canAnalyze}
                onClick={() => inputRef.current?.click()}
              >
                <FileUp className="h-4 w-4" />
                Choose statement
              </Button>
              <Button
                type="button"
                className="bg-emerald-500 text-black hover:bg-emerald-400"
                disabled={!file || analyzing || !effectiveQuota.canAnalyze}
                onClick={() => void analyze()}
              >
                {analyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSearch className="h-4 w-4" />
                )}
                {analyzing ? "Analyzing…" : "Analyze statement"}
              </Button>
            </div>
          </div>
          {effectiveQuota.unlimited ? (
            <p className="text-sm text-emerald-300">
              Admin account — unlimited bank statement analyses.
            </p>
          ) : !effectiveQuota.canAnalyze ? (
            <p className="text-sm text-amber-300">
              Your 5 free bank statement analyses have been used.
            </p>
          ) : null}
          <div className="flex gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <p>
              ContentVerse does not save your uploaded statement or analysis. The file is sent
              securely to Google Gemini for processing. Password-protected PDFs are not supported.
            </p>
          </div>
        </CardContent>
      </Card>

      {analysis ? <AnalysisResult analysis={analysis} /> : null}
    </div>
  );
}

function AnalysisResult({ analysis }: { analysis: BankStatementAnalysis }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Money received" value={analysis.totalCredits} tone="green" />
        <Metric label="Money spent" value={analysis.totalDebits} tone="red" />
        <Metric label="Net cash flow" value={analysis.netCashFlow} />
        <Metric label="Closing balance" value={analysis.closingBalance} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statement summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>{analysis.summary}</p>
          <div className="grid gap-2 text-muted-foreground sm:grid-cols-2">
            {analysis.bankName ? <p>Bank · {analysis.bankName}</p> : null}
            {analysis.accountHolder ? <p>Account holder · {analysis.accountHolder}</p> : null}
            {analysis.accountNumberMasked ? <p>Account · {analysis.accountNumberMasked}</p> : null}
            {analysis.periodStart || analysis.periodEnd ? (
              <p>
                Period · {analysis.periodStart || "—"} to {analysis.periodEnd || "—"}
              </p>
            ) : null}
            <p>
              Transactions · {analysis.creditCount} credits · {analysis.debitCount} debits
            </p>
            <p>Bank charges · {formatInr(analysis.bankCharges)}</p>
          </div>
          {analysis.warnings.length ? (
            <ul className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
              {analysis.warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top expense categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {analysis.topExpenseCategories.map((row) => (
                <li key={row.category} className="flex justify-between gap-3">
                  <span>{row.category}</span>
                  <strong>{formatInr(row.amount)}</strong>
                </li>
              ))}
              {!analysis.topExpenseCategories.length ? (
                <li className="text-muted-foreground">No categories detected.</li>
              ) : null}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recurring payments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {analysis.recurringPayments.map((row) => (
                <li key={`${row.description}-${row.amount}`} className="flex justify-between gap-3">
                  <span>
                    {row.description}
                    <span className="ml-1 text-xs text-muted-foreground">· {row.frequency}</span>
                  </span>
                  <strong>{formatInr(row.amount)}</strong>
                </li>
              ))}
              {!analysis.recurringPayments.length ? (
                <li className="text-muted-foreground">No recurring payments detected.</li>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">
              Transactions ({analysis.transactions.length})
            </CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => downloadTransactionsCsv(analysis.transactions)}
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[560px] overflow-auto rounded-lg border">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {analysis.transactions.map((row, index) => (
                  <tr key={`${row.date}-${row.description}-${index}`}>
                    <td className="whitespace-nowrap px-3 py-2">{row.date}</td>
                    <td className="max-w-[280px] px-3 py-2">{row.description}</td>
                    <td className="px-3 py-2">{row.category}</td>
                    <td
                      className={`px-3 py-2 font-medium ${
                        row.type === "CREDIT" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {row.type}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      {formatInr(row.amount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      {row.balance == null ? "—" : formatInr(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value?: number;
  tone?: "green" | "red";
}) {
  const color =
    tone === "green" ? "text-emerald-400" : tone === "red" ? "text-red-400" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-1 text-xl font-bold ${color}`}>
          {value == null ? "—" : formatInr(value)}
        </p>
      </CardContent>
    </Card>
  );
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function downloadTransactionsCsv(transactions: BankStatementTransaction[]) {
  const rows = [
    ["Date", "Description", "Category", "Type", "Amount", "Balance"],
    ...transactions.map((row) => [
      row.date,
      row.description,
      row.category,
      row.type,
      String(row.amount),
      row.balance == null ? "" : String(row.balance),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "contentverse-bank-statement-analysis.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
