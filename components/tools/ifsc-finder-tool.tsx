"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IfscDetails } from "@/lib/tools/ifsc";

export function IfscFinderTool() {
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<IfscDetails | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 11) {
      toast.error("IFSC must be 11 characters");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/tools/ifsc?code=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "IFSC not found");
        return;
      }
      setResult(data.data);
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enter IFSC code</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-1">
              <Label htmlFor="ifsc" className="sr-only">
                IFSC
              </Label>
              <Input
                id="ifsc"
                placeholder="e.g. HDFC0001234"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={11}
                className="font-mono uppercase"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find branch"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>{result.bank}</CardTitle>
            <p className="text-sm text-muted-foreground">{result.branch}</p>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <Row label="IFSC" value={result.ifsc} mono />
            {result.micr ? <Row label="MICR" value={result.micr} mono /> : null}
            <Row label="City" value={result.city} />
            <Row label="District" value={result.district} />
            <Row label="State" value={result.state} />
            {result.contact ? <Row label="Contact" value={result.contact} /> : null}
            <div className="sm:col-span-2">
              <Row label="Address" value={result.address} />
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-2 pt-2">
              {result.neft ? <BadgePill>NEFT</BadgePill> : null}
              {result.rtgs ? <BadgePill>RTGS</BadgePill> : null}
              {result.imps ? <BadgePill>IMPS</BadgePill> : null}
              {result.upi ? <BadgePill>UPI</BadgePill> : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={mono ? "font-mono font-medium" : "font-medium"}>{value}</p>
    </div>
  );
}

function BadgePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      {children}
    </span>
  );
}
