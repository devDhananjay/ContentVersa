"use client";

import * as React from "react";
import { calculateGst, formatInr, type GstMode } from "@/lib/tools/deposit-calcs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RATES = [0, 5, 12, 18, 28];

export function GstCalculatorTool() {
  const [amount, setAmount] = React.useState("10000");
  const [rate, setRate] = React.useState("18");
  const [mode, setMode] = React.useState<GstMode>("exclusive");

  const result = React.useMemo(
    () =>
      calculateGst({
        amount: Number(amount) || 0,
        ratePercent: Number(rate) || 0,
        mode,
      }),
    [amount, rate, mode]
  );

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">GST calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "exclusive" ? "default" : "outline"}
              onClick={() => setMode("exclusive")}
            >
              Add GST
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "inclusive" ? "default" : "outline"}
              onClick={() => setMode("inclusive")}
            >
              Remove GST
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>
                {mode === "exclusive" ? "Amount before GST (₹)" : "Amount with GST (₹)"}
              </Label>
              <Input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="space-y-1">
              <Label>GST rate (%)</Label>
              <Input
                inputMode="decimal"
                value={rate}
                onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {RATES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRate(String(r))}
                    className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] hover:border-primary"
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {result ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="grid gap-4 py-6 sm:grid-cols-2">
            <Stat label="Taxable value" value={formatInr(result.base)} />
            <Stat label="GST amount" value={formatInr(result.gst)} />
            <Stat label="CGST" value={formatInr(result.cgst)} />
            <Stat label="SGST" value={formatInr(result.sgst)} />
            <div className="sm:col-span-2">
              <Stat label="Total" value={formatInr(result.total)} highlight />
            </div>
          </CardContent>
        </Card>
      ) : null}
      <p className="text-xs text-muted-foreground">
        For interstate supply, IGST equals full GST (CGST+SGST split is for
        intra-state). Confirm HSN rate on the GST portal.
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
