"use client";

import * as React from "react";
import { Gem, Loader2, RefreshCw } from "lucide-react";
import type { SilverPriceSnapshot } from "@/lib/goldverse/silver-price";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function SilverRateTool({ initial }: { initial?: SilverPriceSnapshot }) {
  const [data, setData] = React.useState<SilverPriceSnapshot | null>(initial ?? null);
  const [loading, setLoading] = React.useState(!initial);
  const [grams, setGrams] = React.useState("100");

  React.useEffect(() => {
    if (initial) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/goldverse/silver-price");
      if (res.ok) setData((await res.json()) as SilverPriceSnapshot);
    } finally {
      setLoading(false);
    }
  }

  const weight = Number(grams) || 0;
  const total = data ? Math.round(data.perGram * weight) : 0;

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gem className="h-5 w-5 text-slate-300" />
            Silver rate today (India)
          </CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={refresh} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
        </CardHeader>
        <CardContent>
          {data ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Per gram" value={fmt(data.perGram)} />
              <Stat label="Per 10g" value={fmt(data.per10g)} />
              <Stat label="Per kg" value={fmt(data.perKg)} highlight />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading silver rates…</p>
          )}
          {data ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Source: {data.source === "yahoo" ? "International spot (SI=F) × USD/INR" : "Indicative fallback"} ·{" "}
              Updated {new Date(data.updatedAt).toLocaleString("en-IN")}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estimate by weight</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="grams">Weight (grams)</Label>
            <Input
              id="grams"
              inputMode="decimal"
              value={grams}
              onChange={(e) => setGrams(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estimated value</p>
            <p className="text-2xl font-bold text-primary">{fmt(total)}</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Retail jeweller rates include making charges and GST. Spot is for guidance
        only — confirm with your local dealer.
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
    <div className="rounded-xl border border-border/50 bg-card/60 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={highlight ? "text-xl font-bold" : "text-lg font-semibold"}>{value}</p>
    </div>
  );
}
