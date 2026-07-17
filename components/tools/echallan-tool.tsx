"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EchallanTool() {
  const [vehicle, setVehicle] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [challans, setChallans] = React.useState<Array<Record<string, string>> | null>(
    null
  );
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = vehicle.trim().toUpperCase().replace(/[\s-]/g, "");
    if (v.length < 5) {
      toast.error("Enter a valid vehicle number");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    setChallans(null);
    try {
      const res = await fetch(`/api/tools/echallan?vehicle=${encodeURIComponent(v)}`);
      const data = await res.json();
      if (!data.ok && data.message) {
        setError(data.message);
        return;
      }
      setChallans(data.challans ?? []);
      setMessage(data.message ?? null);
    } catch {
      setError("Lookup failed — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Check e-Challan by vehicle number</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="challan-vehicle" className="sr-only">
                Vehicle
              </Label>
              <Input
                id="challan-vehicle"
                placeholder="e.g. DL8CBG8852"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value.toUpperCase())}
                className="font-mono uppercase"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check challans"}
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Data via ULIP e-Challan. Pay or dispute only on the official{" "}
            <a
              href="https://echallan.parivahan.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              echallan.parivahan.gov.in
            </a>{" "}
            portal.
          </p>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message && !error ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}

      {challans && challans.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">{challans.length} record(s) found</p>
          {challans.map((c, i) => (
            <Card key={i}>
              <CardContent className="grid gap-2 py-4 text-sm sm:grid-cols-2">
                {Object.entries(c)
                  .slice(0, 12)
                  .map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-muted-foreground">{k}</p>
                      <p className="font-medium break-all">{v}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
