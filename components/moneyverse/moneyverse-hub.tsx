"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  IndianRupee,
  Loader2,
  Plus,
  Trash2,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/components/auth/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  REMINDER_TYPES,
  categoryEmoji,
  categoryLabel,
} from "@/lib/moneyverse/categories";
import { formatMonthLabel, monthKey, parseMonthKey } from "@/lib/moneyverse/dates";
import type { MoneyMonthSummary } from "@/lib/moneyverse/types";
import type { MoneyExpenseCategory, MoneyPaymentMethod } from "@prisma/client";
import { cn } from "@/lib/utils";
import { ExpenseScreenshotScan } from "@/components/moneyverse/expense-screenshot-scan";
import type { ScreenshotScanResult } from "@/lib/moneyverse/screenshot-scan";

function formatInr(n: number) {
  return n.toLocaleString("en-IN");
}

function shiftMonth(key: string, delta: number) {
  const p = parseMonthKey(key);
  if (!p) return monthKey();
  const d = new Date(p.start);
  d.setMonth(d.getMonth() + delta);
  return monthKey(d);
}

export function MoneyVerseHub() {
  const { isSignedIn, loading: sessionLoading } = useSession();
  const [month, setMonth] = React.useState(monthKey());
  const [summary, setSummary] = React.useState<MoneyMonthSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState<MoneyExpenseCategory>("FOOD");
  const [method, setMethod] = React.useState<MoneyPaymentMethod>("UPI");
  const [note, setNote] = React.useState("");
  const [scannedSpentAt, setScannedSpentAt] = React.useState<string | undefined>();

  const [budgetEdits, setBudgetEdits] = React.useState<Record<string, string>>({});

  const [remTitle, setRemTitle] = React.useState("");
  const [remType, setRemType] = React.useState<"CREDIT_CARD" | "SIP" | "CUSTOM">("CREDIT_CARD");
  const [remDay, setRemDay] = React.useState("5");
  const [remAmount, setRemAmount] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/moneyverse/summary?month=${month}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (res.ok) {
        const data = (await res.json()) as MoneyMonthSummary;
        setSummary({ ...data, loggedIn: data.loggedIn || isSignedIn });
        const edits: Record<string, string> = {};
        for (const b of data.budgets) {
          edits[b.category] = String(b.limitAmount);
        }
        setBudgetEdits(edits);
      }
    } finally {
      setLoading(false);
    }
  }, [month, isSignedIn]);

  React.useEffect(() => {
    if (!sessionLoading) void load();
  }, [load, sessionLoading]);

  async function addExpense(e: React.FormEvent) {
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
        if (res.status === 401) toast.error("Sign in to add expenses");
        else toast.error(data.error || "Failed to save");
        return;
      }
      setSummary(data.summary);
      setAmount("");
      setNote("");
      setScannedSpentAt(undefined);
      toast.success("Expense added");
    } finally {
      setSaving(false);
    }
  }

  async function deleteExpense(id: string) {
    const res = await fetch(`/api/moneyverse/expenses/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      setSummary(data.summary);
      toast.success("Removed");
    }
  }

  async function saveBudget(cat: MoneyExpenseCategory) {
    const val = parseInt(budgetEdits[cat] ?? "0", 10);
    if (!Number.isFinite(val) || val < 0) return;
    const res = await fetch("/api/moneyverse/budgets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ category: cat, limitAmount: val }),
    });
    const data = await res.json();
    if (res.ok) {
      setSummary(data.summary);
      toast.success("Budget updated");
    } else if (res.status === 401) toast.error("Sign in required");
  }

  async function addReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!remTitle.trim()) return;
    const res = await fetch("/api/moneyverse/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        type: remType,
        title: remTitle.trim(),
        dueDay: parseInt(remDay, 10) || 1,
        amount: remAmount ? parseInt(remAmount, 10) : null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setSummary(data.summary);
      setRemTitle("");
      setRemAmount("");
      toast.success("Reminder added");
    } else if (res.status === 401) toast.error("Sign in required");
  }

  async function deleteReminder(id: string) {
    const res = await fetch(`/api/moneyverse/reminders/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) setSummary(data.summary);
  }

  const loggedIn = isSignedIn || (summary?.loggedIn ?? false);
  const maxCategory = Math.max(...(summary?.byCategory.map((c) => c.amount) ?? [1]), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-semibold">
            {formatMonthLabel(month)}
          </span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {summary?.error === "schema_stale" ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          MoneyVerse tables not ready — run{" "}
          <code className="text-xs">npm run db:push:local</code> (with{" "}
          <code className="text-xs">npm run db:tunnel</code> running).
        </div>
      ) : null}

      {!sessionLoading && !loggedIn ? (
        <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
          <Wallet className="mx-auto h-10 w-10 text-emerald-400" />
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in to track expenses, set budgets and save reminders. Your data stays
            private to your account.
          </p>
          <Link href={`/auth/sign-in?next=/moneyverse`}>
            <Button className="mt-4 bg-emerald-500 text-black hover:bg-emerald-400">
              Sign in to MoneyVerse
            </Button>
          </Link>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Spent</p>
          <p className="font-display text-2xl font-bold text-emerald-300">
            ₹{formatInr(summary?.totalSpent ?? 0)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {summary?.expenseCount ?? 0} transactions
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Budget left</p>
          <p className="font-display text-2xl font-bold">
            ₹{formatInr(summary?.budgetRemaining ?? 0)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            of ₹{formatInr(summary?.totalBudget ?? 0)} planned
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Reminders</p>
          <p className="font-display text-2xl font-bold">
            {summary?.reminders.length ?? 0}
          </p>
          <p className="text-[11px] text-muted-foreground">credit card · SIP · custom</p>
        </div>
      </div>

      <Link
        href="/moneyverse/bank-statement-analyzer"
        className="block rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-card to-card p-5 transition-colors hover:border-emerald-500/50"
      >
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
          <FileSearch className="h-3.5 w-3.5" />
          Bank Statement Analyzer
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload a bank statement PDF or image — AI extracts credits, debits, categories,
          recurring payments and cash-flow. Download CSV. 5 free analyses per user.
        </p>
        <span className="mt-3 inline-flex text-sm font-medium text-emerald-300">
          Open analyzer →
        </span>
      </Link>

      {loggedIn ? (
        <div id="screenshot-scan-ocr" className="space-y-2">
          <ExpenseScreenshotScan
            disabled={!loggedIn || saving}
            onScan={(data: ScreenshotScanResult) => {
              setAmount(String(data.amount));
              setCategory(data.category);
              setMethod(data.method);
              setNote(data.note);
              setScannedSpentAt(data.spentAt);
            }}
          />
          <p className="text-center text-[11px] text-muted-foreground">
            <Link href="/moneyverse/screenshot-scan" className="text-violet-300 hover:underline">
              Screenshot Scan (OCR)
            </Link>{" "}
            — dedicated page with guide & FAQ
          </p>
        </div>
      ) : null}

      <section className="rounded-2xl border border-emerald-500/20 bg-card/50 p-5 md:p-6">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Plus className="h-3.5 w-3.5" />
          Add expense
        </p>
        <form onSubmit={addExpense} className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="mv-amount">Amount (₹)</Label>
            <Input
              id="mv-amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              className="mt-1"
              disabled={!loggedIn || saving}
            />
          </div>
          <div>
            <Label htmlFor="mv-cat">Category</Label>
            <select
              id="mv-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as MoneyExpenseCategory)}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={!loggedIn || saving}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="mv-method">Payment</Label>
            <select
              id="mv-method"
              value={method}
              onChange={(e) => setMethod(e.target.value as MoneyPaymentMethod)}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={!loggedIn || saving}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="mv-note">Note (optional)</Label>
            <Input
              id="mv-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Swiggy, petrol…"
              className="mt-1"
              disabled={!loggedIn || saving}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            <Button
              type="submit"
              disabled={!loggedIn || saving}
              className="bg-emerald-500 text-black hover:bg-emerald-400"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <IndianRupee className="h-4 w-4" />}
              Save expense
            </Button>
          </div>
        </form>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border/60 bg-card/50 p-5 md:p-6">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <TrendingDown className="h-3.5 w-3.5" />
            Monthly report
          </p>
          {summary?.byCategory.length ? (
            <ul className="mt-4 space-y-3">
              {summary.byCategory.map((row) => (
                <li key={row.category}>
                  <div className="flex justify-between text-sm">
                    <span>
                      {categoryEmoji(row.category)} {categoryLabel(row.category)}
                    </span>
                    <span className="font-semibold">₹{formatInr(row.amount)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500/70"
                      style={{ width: `${(row.amount / maxCategory) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No expenses this month yet.</p>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/50 p-5 md:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Budget planner
          </p>
          <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
            {EXPENSE_CATEGORIES.map((c) => {
              const live = summary?.budgets.find((b) => b.category === c.id);
              return (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-border/40 bg-muted/10 px-3 py-2"
                >
                  <span className="flex-1 text-sm">
                    {c.emoji} {c.label}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    className="h-8 w-24"
                    placeholder="₹/mo"
                    value={budgetEdits[c.id] ?? ""}
                    onChange={(e) =>
                      setBudgetEdits((prev) => ({ ...prev, [c.id]: e.target.value }))
                    }
                    disabled={!loggedIn}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8"
                    disabled={!loggedIn}
                    onClick={() => saveBudget(c.id)}
                  >
                    Set
                  </Button>
                  {live && live.limitAmount > 0 ? (
                    <span
                      className={cn(
                        "w-full text-[10px]",
                        live.percentUsed >= 90 ? "text-red-400" : "text-muted-foreground"
                      )}
                    >
                      ₹{formatInr(live.spent)} / ₹{formatInr(live.limitAmount)} (
                      {live.percentUsed}%)
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card/50 p-5 md:p-6">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Bell className="h-3.5 w-3.5" />
          Reminders
        </p>
        <form onSubmit={addReminder} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={remType}
            onChange={(e) => setRemType(e.target.value as typeof remType)}
            className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
            disabled={!loggedIn}
          >
            {REMINDER_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <Input
            placeholder="Title e.g. HDFC card"
            value={remTitle}
            onChange={(e) => setRemTitle(e.target.value)}
            disabled={!loggedIn}
          />
          <Input
            type="number"
            min={1}
            max={31}
            placeholder="Due day"
            value={remDay}
            onChange={(e) => setRemDay(e.target.value)}
            disabled={!loggedIn}
          />
          <Input
            type="number"
            placeholder="Amount ₹ (opt)"
            value={remAmount}
            onChange={(e) => setRemAmount(e.target.value)}
            disabled={!loggedIn}
          />
          <Button type="submit" disabled={!loggedIn} variant="outline" className="border-emerald-500/30">
            Add reminder
          </Button>
        </form>
        <ul className="mt-4 space-y-2">
          {summary?.reminders.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/10 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {REMINDER_TYPES.find((t) => t.id === r.type)?.label} · day {r.dueDay}
                  {r.amount ? ` · ₹${formatInr(r.amount)}` : ""} · in {r.daysUntilDue}d
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-red-400"
                onClick={() => deleteReminder(r.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
          {!summary?.reminders.length ? (
            <p className="text-sm text-muted-foreground">No reminders — add credit card or SIP due dates.</p>
          ) : null}
        </ul>
      </section>

      {loggedIn && summary?.expenses.length ? (
        <section className="rounded-2xl border border-border/60 bg-card/50 p-5 md:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Recent expenses
          </p>
          <ul className="mt-4 divide-y divide-border/40">
            {summary.expenses.map((ex) => (
              <li key={ex.id} className="flex items-center justify-between gap-2 py-3 first:pt-0">
                <div>
                  <p className="text-sm font-medium">
                    {categoryEmoji(ex.category)} ₹{formatInr(ex.amount)}
                    {ex.note ? (
                      <span className="font-normal text-muted-foreground"> · {ex.note}</span>
                    ) : null}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {categoryLabel(ex.category)} · {ex.method} ·{" "}
                    {new Date(ex.spentAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteExpense(ex.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
