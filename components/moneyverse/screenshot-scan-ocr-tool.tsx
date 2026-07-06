"use client";

import * as React from "react";
import Link from "next/link";
import { IndianRupee, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/components/auth/use-session";
import { ExpenseScreenshotScan } from "@/components/moneyverse/expense-screenshot-scan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
} from "@/lib/moneyverse/categories";
import type { ScreenshotScanResult } from "@/lib/moneyverse/screenshot-scan";
import type { MoneyExpenseCategory, MoneyPaymentMethod } from "@prisma/client";

export function ScreenshotScanOcrTool() {
  const { isSignedIn, loading: sessionLoading } = useSession();
  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState<MoneyExpenseCategory>("FOOD");
  const [method, setMethod] = React.useState<MoneyPaymentMethod>("UPI");
  const [note, setNote] = React.useState("");
  const [scannedSpentAt, setScannedSpentAt] = React.useState<string | undefined>();
  const [saving, setSaving] = React.useState(false);

  async function saveExpense(e: React.FormEvent) {
    e.preventDefault();
    const val = parseInt(amount, 10);
    if (!val || val <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/moneyverse/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: val,
          category,
          method,
          note: note.trim() || undefined,
          spentAt: scannedSpentAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) toast.error("Sign in to save expenses");
        else toast.error(data.error || "Failed to save");
        return;
      }
      setAmount("");
      setNote("");
      setScannedSpentAt(undefined);
      toast.success("Expense saved from OCR scan");
    } finally {
      setSaving(false);
    }
  }

  if (sessionLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/5 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Sign in to use Screenshot Scan (OCR) — upload a UPI payment image and auto-fill
          your expense.
        </p>
        <Link href="/auth/sign-in?next=/moneyverse/screenshot-scan">
          <Button className="mt-4 bg-violet-500 text-white hover:bg-violet-400">
            Sign in for OCR scan
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="screenshot-scan-ocr">
      <ExpenseScreenshotScan
        disabled={saving}
        onScan={(data: ScreenshotScanResult) => {
          setAmount(String(data.amount));
          setCategory(data.category);
          setMethod(data.method);
          setNote(data.note);
          setScannedSpentAt(data.spentAt);
        }}
      />

      <form
        onSubmit={saveExpense}
        className="rounded-2xl border border-border/60 bg-card/50 p-5 md:p-6"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Review OCR result
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="ocr-amount">Amount (₹)</Label>
            <Input
              id="ocr-amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
              disabled={saving}
            />
          </div>
          <div>
            <Label htmlFor="ocr-cat">Category</Label>
            <select
              id="ocr-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as MoneyExpenseCategory)}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={saving}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="ocr-method">Payment</Label>
            <select
              id="ocr-method"
              value={method}
              onChange={(e) => setMethod(e.target.value as MoneyPaymentMethod)}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={saving}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="ocr-note">Merchant / note</Label>
            <Input
              id="ocr-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1"
              disabled={saving}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="mt-4 gap-2 bg-violet-500 text-white hover:bg-violet-400"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <IndianRupee className="h-4 w-4" />}
          Save expense
        </Button>
      </form>
    </div>
  );
}
