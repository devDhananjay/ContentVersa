"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "JPY", "AUD", "CAD", "SGD", "CHF"] as const;

export function CurrencyConverterTool() {
  const [amount, setAmount] = React.useState("100");
  const [from, setFrom] = React.useState("INR");
  const [to, setTo] = React.useState("USD");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{
    result: number;
    rate: number;
    date: string | null;
  } | null>(null);

  async function convert(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ amount, from, to });
      const res = await fetch(`/api/tools/currency?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setResult({ result: json.result, rate: json.rate, date: json.date });
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Convert currency</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={convert} className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1 sm:col-span-3">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="from">From</Label>
              <select
                id="from"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="to">To</Label>
              <select
                id="to"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Convert"}
              </Button>
            </div>
          </form>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          {result ? (
            <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="text-2xl font-semibold tracking-tight">
                {result.result.toLocaleString(undefined, { maximumFractionDigits: 4 })} {to}
              </p>
              <p className="mt-1 text-muted-foreground">
                1 {from} ≈ {result.rate.toLocaleString(undefined, { maximumFractionDigits: 6 })}{" "}
                {to}
                {result.date ? ` · rates as of ${result.date}` : ""}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Mid-market rates via Frankfurter (ECB). Not for banking settlement.
      </p>
    </div>
  );
}
