"use client";

import * as React from "react";
import { decodeVehiclePlate } from "@/lib/tools/rto-codes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VehiclePlateDecoderTool() {
  const [plate, setPlate] = React.useState("");
  const result = React.useMemo(() => {
    if (plate.trim().length < 4) return null;
    return decodeVehiclePlate(plate);
  }, [plate]);

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vehicle registration number</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="plate" className="sr-only">
            Plate
          </Label>
          <Input
            id="plate"
            placeholder="e.g. MH12AB1234 or 22BH1234AA"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            className="font-mono uppercase"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Decodes state and RTO from plate format only — not owner details. For RC
            status use the official{" "}
            <a
              href="https://vahan.parivahan.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Vahan portal
            </a>
            .
          </p>
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{result.message}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <Field label="Number" value={result.normalized} />
            {result.stateName ? <Field label="State" value={result.stateName} /> : null}
            {result.rtoCode ? <Field label="RTO code" value={result.rtoCode} mono /> : null}
            {result.series ? <Field label="Series" value={result.series} mono /> : null}
            {result.number ? <Field label="Number part" value={result.number} mono /> : null}
            {result.isBhSeries ? (
              <p className="sm:col-span-2 text-xs text-muted-foreground">
                Bharat (BH) series plates are designed for employees with transferable
                jobs across states.
              </p>
            ) : null}
            {result.rto ? (
              <div className="sm:col-span-2 rounded-lg border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">RTO office</p>
                <p className="font-medium">
                  {result.rto.code} — {result.rto.city}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{result.rto.address}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={mono ? "font-mono font-medium" : "font-medium"}>{value}</p>
    </div>
  );
}
