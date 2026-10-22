"use client";

import * as React from "react";
import { calculateTakeHome, formatInr } from "@/lib/tools/money-calcs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TakeHomeCalculatorTool() {
  const [basic, setBasic] = React.useState("44900");
  const [da, setDa] = React.useState("53");
  const [hra, setHra] = React.useState("27");
  const [otherAll, setOtherAll] = React.useState("3600");
  const [pf, setPf] = React.useState("10");
  const [otherDed, setOtherDed] = React.useState("0");
  const [tds, setTds] = React.useState("0");

  const result = React.useMemo(
    () =>
      calculateTakeHome({
        basicPay: Number(basic) || 0,
        daPercent: Number(da) || 0,
        hraPercent: Number(hra) || 0,
        otherAllowances: Number(otherAll) || 0,
        pfPercent: Number(pf) || 0,
        otherDeductions: Number(otherDed) || 0,
        tds: Number(tds) || 0,
      }),
    [basic, da, hra, otherAll, pf, otherDed, tds]
  );

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payslip inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field id="basic" label="Basic pay (₹)" value={basic} onChange={setBasic} />
          <Field id="da" label="DA (% of basic)" value={da} onChange={setDa} decimal />
          <Field id="hra" label="HRA (% of basic)" value={hra} onChange={setHra} decimal />
          <Field
            id="other-all"
            label="Other allowances (₹)"
            value={otherAll}
            onChange={setOtherAll}
          />
          <Field
            id="pf"
            label="PF / NPS (% of basic+DA)"
            value={pf}
            onChange={setPf}
            decimal
          />
          <Field
            id="other-ded"
            label="Other deductions (₹)"
            value={otherDed}
            onChange={setOtherDed}
          />
          <Field id="tds" label="TDS this month (₹)" value={tds} onChange={setTds} />
        </CardContent>
      </Card>

      {result ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="grid gap-4 py-6 sm:grid-cols-2">
            <Stat label="DA" value={formatInr(result.da)} />
            <Stat label="HRA" value={formatInr(result.hra)} />
            <Stat label="Gross earnings" value={formatInr(result.gross)} />
            <Stat label="PF / NPS" value={formatInr(result.pf)} />
            <Stat label="Total deductions" value={formatInr(result.totalDeductions)} />
            <Stat label="Net take-home" value={formatInr(result.net)} highlight />
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Enter a valid basic pay.</p>
      )}

      <p className="text-xs text-muted-foreground">
        Approximate slip math for learning — DA/HRA rates and NPS vs GPF rules differ by
        cadre and city. Match your official payslip / Form 16.
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
