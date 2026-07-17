"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FastagTool() {
  const [vehicle, setVehicle] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [fields, setFields] = React.useState<Record<string, string> | null>(null);
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
    setFields(null);
    try {
      const res = await fetch(`/api/tools/fastag?vehicle=${encodeURIComponent(v)}`);
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "No FASTag details found");
        return;
      }
      setFields(data.fields ?? {});
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
          <CardTitle className="text-lg">FASTag check by vehicle number</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="fastag-vehicle" className="sr-only">
                Vehicle
              </Label>
              <Input
                id="fastag-vehicle"
                placeholder="e.g. CG07BC9186"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value.toUpperCase())}
                className="font-mono uppercase"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check FASTag"}
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            ULIP FASTag status lookup. For balance & recharge use your bank / NETC app.
          </p>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {fields && Object.keys(fields).length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>FASTag details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            {Object.entries(fields).map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-muted-foreground">{k}</p>
                <p className="font-medium break-all">{v}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
