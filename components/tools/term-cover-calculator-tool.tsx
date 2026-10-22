"use client";

import * as React from "react";
import {
  estimateTermCover,
  estimateTermPremium,
  formatInr,
} from "@/lib/tools/money-calcs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TermCoverCalculatorTool() {
  const [annual, setAnnual] = React.useState("600000");
  const [years, setYears] = React.useState("15");
  const [loans, setLoans] = React.useState("0");
  const [existing, setExisting] = React.useState("0");
  const [perLakh, setPerLakh] = React.useState("500");

  const cover = React.useMemo(
    () =>
      estimateTermCover({
        annualTakeHome: Number(annual) || 0,
        yearsOfSupport: Number(years) || 0,
        outstandingLoans: Number(loans) || 0,
        existingCover: Number(existing) || 0,
      }),
    [annual, years, loans, existing]
  );

  const premium = React.useMemo(() => {
    if (!cover) return null;
    return estimateTermPremium({
      cover: cover.suggestedCover,
      rupeesPerLakhPerYear: Number(perLakh) || 0,
    });
  }, [cover, perLakh]);

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Income & liabilities</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            id="annual"
            label="Annual take-home (₹)"
            value={annual}
            onChange={setAnnual}
          />
          <Field
            id="years"
            label="Years of support to plan"
            value={years}
            onChange={setYears}
          />
          <Field
            id="loans"
            label="Outstanding loans (₹)"
            value={loans}
            onChange={setLoans}
          />
          <Field
            id="existing"
            label="Existing life cover (₹)"
            value={existing}
            onChange={setExisting}
          />
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="per-lakh">Illustrative premium (₹ / lakh / year)</Label>
            <Input
              id="per-lakh"
              inputMode="decimal"
              value={perLakh}
              onChange={(e) => setPerLakh(e.target.value.replace(/[^\d.]/g, ""))}
            />
            <p className="text-[11px] text-muted-foreground">
              Paste a quote from an insurer quote page — this is not our rate card.
            </p>
          </div>
        </CardContent>
      </Card>

      {cover ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="grid gap-4 py-6 sm:grid-cols-3">
            <Stat label="Income × years" value={formatInr(cover.incomeMultiple)} />
            <Stat label="Suggested cover" value={formatInr(cover.suggestedCover)} highlight />
            <Stat
              label="Illustrative annual premium"
              value={premium != null ? formatInr(premium) : "—"}
            />
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Enter annual take-home and years.</p>
      )}

      <p className="text-xs text-muted-foreground">
        Educational estimate only — not a policy recommendation or SEBI/IRDAI advice.
        Underwriting, medicals, and riders change real premiums.
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
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
