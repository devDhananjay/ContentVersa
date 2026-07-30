"use client";

import * as React from "react";
import { calculateFd, formatInr } from "@/lib/tools/deposit-calcs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FdCalculatorTool() {
  const [principal, setPrincipal] = React.useState("100000");
  const [rate, setRate] = React.useState("7");
  const [years, setYears] = React.useState("5");

  const result = React.useMemo(
    () =>
      calculateFd({
        principal: Number(principal) || 0,
        annualRate: Number(rate) || 0,
        years: Number(years) || 0,
      }),
    [principal, rate, years]
  );

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fixed Deposit details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Principal (₹)" value={principal} onChange={setPrincipal} />
          <Field label="Interest (% p.a.)" value={rate} onChange={setRate} decimal />
          <Field label="Tenure (years)" value={years} onChange={setYears} />
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
        Assumes quarterly compounding (common for Indian bank FDs). Actual bank
        payouts may differ — confirm with your bank.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  decimal,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  decimal?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        inputMode={decimal ? "decimal" : "numeric"}
        value={value}
        onChange={(e) =>
          onChange(
            decimal
              ? e.target.value.replace(/[^\d.]/g, "")
              : e.target.value.replace(/\D/g, "")
          )
        }
      />
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
