"use client";

import * as React from "react";
import { calculatePpf, formatInr } from "@/lib/tools/deposit-calcs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PpfCalculatorTool() {
  const [yearly, setYearly] = React.useState("150000");
  const [rate, setRate] = React.useState("7.1");
  const [years, setYears] = React.useState("15");

  const result = React.useMemo(
    () =>
      calculatePpf({
        yearlyDeposit: Number(yearly) || 0,
        annualRate: Number(rate) || 0,
        years: Number(years) || 0,
      }),
    [yearly, rate, years]
  );

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">PPF details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>Yearly deposit (₹)</Label>
            <Input
              inputMode="numeric"
              value={yearly}
              onChange={(e) => setYearly(e.target.value.replace(/\D/g, ""))}
            />
            <p className="text-[11px] text-muted-foreground">Max ₹1.5 lakh / year</p>
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
            <Label>Years</Label>
            <Input
              inputMode="numeric"
              value={years}
              onChange={(e) => setYears(e.target.value.replace(/\D/g, ""))}
            />
            <p className="text-[11px] text-muted-foreground">Default lock-in 15 years</p>
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
        PPF interest is set by the Government of India and may change quarterly.
        This is a planning estimate, not official Post Office output.
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
