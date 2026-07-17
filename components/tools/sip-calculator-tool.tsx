"use client";

import * as React from "react";
import { calculateSip, formatInr } from "@/lib/tools/emi-sip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SipCalculatorTool() {
  const [monthly, setMonthly] = React.useState("10000");
  const [rate, setRate] = React.useState("12");
  const [years, setYears] = React.useState("10");

  const result = React.useMemo(() => {
    return calculateSip({
      monthlyInvestment: Number(monthly) || 0,
      annualReturn: Number(rate) || 0,
      years: Number(years) || 0,
    });
  }, [monthly, rate, years]);

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SIP details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="monthly">Monthly SIP (₹)</Label>
            <Input
              id="monthly"
              inputMode="numeric"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sip-rate">Expected return (% p.a.)</Label>
            <Input
              id="sip-rate"
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="years">Duration (years)</Label>
            <Input
              id="years"
              inputMode="numeric"
              value={years}
              onChange={(e) => setYears(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </CardContent>
      </Card>

      {result ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="grid gap-4 py-6 sm:grid-cols-3">
            <Stat label="Invested" value={formatInr(result.invested)} />
            <Stat label="Est. returns" value={formatInr(result.estimatedReturns)} />
            <Stat label="Maturity value" value={formatInr(result.maturityValue)} highlight />
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Enter valid SIP values above.</p>
      )}

      <p className="text-xs text-muted-foreground">
        Illustrative estimate only. Mutual fund returns are market-linked and not
        guaranteed.
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
      <p className={highlight ? "text-2xl font-bold text-primary" : "text-lg font-semibold"}>
        {value}
      </p>
    </div>
  );
}
