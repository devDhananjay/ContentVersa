"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PincodeResult } from "@/lib/tools/pincode";

export function PincodeFinderTool() {
  const [pincode, setPincode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<PincodeResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = pincode.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/tools/pincode?pincode=${trimmed}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Pincode not found");
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
          <CardTitle className="text-lg">Search pincode</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-1">
              <Label htmlFor="pincode" className="sr-only">
                Pincode
              </Label>
              <Input
                id="pincode"
                inputMode="numeric"
                placeholder="e.g. 110001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="font-mono"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>Pincode {result.pincode}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {result.offices[0]?.district}, {result.offices[0]?.state}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.offices.map((o) => (
              <div
                key={o.name}
                className="rounded-lg border border-border/60 p-3 text-sm"
              >
                <p className="font-medium">{o.name}</p>
                <p className="text-muted-foreground">
                  {o.branchType} · {o.deliveryStatus} · {o.circle}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
