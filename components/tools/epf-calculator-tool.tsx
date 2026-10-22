"use client";

import * as React from "react";
import { projectEpf, formatInr } from "@/lib/tools/money-calcs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EpfCalculatorTool() {
  const [balance, setBalance] = React.useState("250000");
  const [employee, setEmployee] = React.useState("1800");
  const [employer, setEmployer] = React.useState("1800");
  const [rate, setRate] = React.useState("8.25");
  const [years, setYears] = React.useState("10");

  const result = React.useMemo(
    () =>
      projectEpf({
        currentBalance: Number(balance) || 0,
        monthlyEmployee: Number(employee) || 0,
        monthlyEmployer: Number(employer) || 0,
        annualRate: Number(rate) || 0,
        years: Number(years) || 0,
      }),
    [balance, employee, employer, rate, years]
  );

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">EPF projection</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field id="bal" label="Current balance (₹)" value={balance} onChange={setBalance} />
          <Field
            id="emp"
            label="Your monthly contribution (₹)"
            value={employee}
            onChange={setEmployee}
          />
          <Field
            id="er"
            label="Employer monthly (₹)"
            value={employer}
            onChange={setEmployer}
          />
          <Field
            id="rate"
            label="Assumed interest (% p.a.)"
            value={rate}
            onChange={setRate}
            decimal
          />
          <Field id="years" label="Years to project" value={years} onChange={setYears} />
        </CardContent>
      </Card>

      {result ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="grid gap-4 py-6 sm:grid-cols-3">
            <Stat label="Future contributions" value={formatInr(result.totalContributed)} />
            <Stat
              label="Est. interest in period"
              value={formatInr(result.estimatedInterest)}
            />
            <Stat
              label="Projected balance"
              value={formatInr(result.projectedBalance)}
              highlight
            />
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Enter years and a non-negative rate.</p>
      )}

      <p className="text-xs text-muted-foreground">
        Smooth monthly compounding for planning talks — not your EPFO passbook. Notified
        rates and EPS splits change. For withdrawals, read the PF withdrawal guide and
        the member portal.
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  decimal,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  decimal?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
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
      <p className={highlight ? "text-2xl font-bold text-primary" : "text-lg font-semibold"}>
        {value}
      </p>
    </div>
  );
}
