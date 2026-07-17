"use client";

import * as React from "react";
import { calculateEmi, formatInr } from "@/lib/tools/emi-sip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmiCalculatorTool() {
  const [principal, setPrincipal] = React.useState("2500000");
  const [rate, setRate] = React.useState("8.5");
  const [tenure, setTenure] = React.useState("240");

  const result = React.useMemo(() => {
    return calculateEmi({
      principal: Number(principal) || 0,
      annualRate: Number(rate) || 0,
      tenureMonths: Number(tenure) || 0,
    });
  }, [principal, rate, tenure]);

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Loan details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1 sm:col-span-3">
            <Label htmlFor="principal">Loan amount (₹)</Label>
            <Input
              id="principal"
              inputMode="numeric"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="rate">Interest rate (% p.a.)</Label>
            <Input
              id="rate"
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="tenure">Tenure (months)</Label>
            <Input
              id="tenure"
              inputMode="numeric"
              value={tenure}
              onChange={(e) => setTenure(e.target.value.replace(/\D/g, ""))}
            />
            <p className="text-xs text-muted-foreground">
              {Math.round((Number(tenure) || 0) / 12)} years approx.
            </p>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="grid gap-4 py-6 sm:grid-cols-3">
            <Stat label="Monthly EMI" value={formatInr(result.emi)} highlight />
            <Stat label="Total interest" value={formatInr(result.totalInterest)} />
            <Stat label="Total payment" value={formatInr(result.totalPayment)} />
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Enter valid loan values above.</p>
      )}
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
