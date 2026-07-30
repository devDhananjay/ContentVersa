"use client";

import * as React from "react";
import { ExternalLink, Loader2, TrainFront } from "lucide-react";
import {
  isValidPnr,
  pnrCheckLinks,
  type PnrLookupResult,
} from "@/lib/tools/railway";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PnrStatusTool() {
  const [pnr, setPnr] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<PnrLookupResult | null>(null);

  const valid = isValidPnr(pnr);
  const links = valid ? pnrCheckLinks(pnr) : [];

  async function check() {
    if (!valid) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/tools/pnr?pnr=${encodeURIComponent(pnr.trim())}`,
        { signal: AbortSignal.timeout(10000) }
      );
      const data = (await res.json()) as PnrLookupResult;
      setResult(data);
    } catch {
      setResult({
        ok: false,
        pnr: pnr.trim(),
        message:
          "Could not load a live feed right now. Use ConfirmTkt / RailYatri below — they open with your PNR.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrainFront className="h-5 w-5" />
            Check PNR status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="pnr">10-digit PNR</Label>
            <Input
              id="pnr"
              inputMode="numeric"
              maxLength={10}
              value={pnr}
              onChange={(e) =>
                setPnr(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && valid) void check();
              }}
              placeholder="1234567890"
              className="font-mono text-lg tracking-widest"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => void check()}
              disabled={!valid || loading}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Try live check
            </Button>
            {valid ? (
              <Button type="button" variant="cta" asChild>
                <a
                  href={links[0]?.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open ConfirmTkt
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            ) : null}
          </div>
          {result ? (
            <div
              className={`rounded-lg border p-4 text-sm space-y-2 ${
                result.ok
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-border/60 bg-muted/30"
              }`}
            >
              <p>{result.message}</p>
              {result.ok ? (
                <dl className="grid gap-1 sm:grid-cols-2">
                  {result.trainNumber ? (
                    <>
                      <dt className="text-muted-foreground">Train</dt>
                      <dd className="font-medium">
                        {result.trainNumber}
                        {result.trainName ? ` · ${result.trainName}` : ""}
                      </dd>
                    </>
                  ) : null}
                  {result.from || result.to ? (
                    <>
                      <dt className="text-muted-foreground">Route</dt>
                      <dd className="font-medium">
                        {result.from || "—"} → {result.to || "—"}
                      </dd>
                    </>
                  ) : null}
                  {result.journeyDate ? (
                    <>
                      <dt className="text-muted-foreground">Journey</dt>
                      <dd className="font-medium">{result.journeyDate}</dd>
                    </>
                  ) : null}
                </dl>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {links.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trusted PNR sites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-3 py-2 font-medium text-primary hover:border-primary/40"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {l.label}
              </a>
            ))}
            <p className="text-xs text-muted-foreground pt-2">
              Indian Railways has no stable free public PNR API. ConfirmTkt /
              RailYatri / IRCTC are the reliable way to see berth status.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
