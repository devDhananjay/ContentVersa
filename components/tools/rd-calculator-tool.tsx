"use client";

import * as React from "react";
import { calculateRd, formatInr } from "@/lib/tools/deposit-calcs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RdCalculatorTool() {
  const [monthly, setMonthly] = React.useState("5000");
  const [rate, setRate] = React.useState("6.5");
  const [months, setMonths] = React.useState("36");

  const result = React.useMemo(
    () =>
      calculateRd({
        monthlyDeposit: Number(monthly) || 0,
        annualRate: Number(rate) || 0,
        months: Number(months) || 0,
      }),
    [monthly, rate, months]
  );

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recurring Deposit details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>Monthly deposit (₹)</Label>
            <Input
              inputMode="numeric"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="space-y-1">
            <Label>Interest (% p.a.)</Label>
            <Input
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </div>
          <div className="space-y-1">
            <Label>Tenure (months)</Label>
            <Input
              inputMode="numeric"
              value={months}
              onChange={(e) => setMonths(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </CardContent>
      </Card>
      {result ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="grid gap-4 py-6 sm:grid-cols-3">
            <Stat label="Invested" value={formatInr(result.invested)} />
            <Stat label="Interest" value={formatInr(result.interest)} />
            <Stat label="Maturity" value={formatInr(result.maturity)} highlight />
          </CardContent>
        </Card>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Illustrative estimate with monthly compounding. Bank RD formulas vary —
        verify with your bank before investing.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={highlight ? "text-lg font-bold text-primary" : "text-lg font-semibold"}>
        {value}
      </p>
    </div>
  );
}
