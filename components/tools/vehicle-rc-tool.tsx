"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FIELD_LABELS: Record<string, string> = {
  rc_regn_no: "Registration no.",
  rc_owner_name: "Owner",
  rc_regn_dt: "Registration date",
  rc_fit_upto: "Fitness up to",
  rc_tax_upto: "Tax up to",
  rc_insurance_upto: "Insurance up to",
  rc_insurance_comp: "Insurer",
  rc_status: "RC status",
  rc_vch_catg: "Category",
  rc_vh_class_desc: "Vehicle class",
  rc_maker_desc: "Maker",
  rc_maker_model: "Model",
  rc_body_type_desc: "Body type",
  rc_fuel_desc: "Fuel",
  rc_color: "Colour",
  rc_chasi_no: "Chassis",
  rc_eng_no: "Engine",
  rc_registered_at: "Registered at",
  rc_owner_sr: "Owner serial",
  rc_financer: "Financer",
  rc_pucc_upto: "PUCC up to",
  rc_blacklist_status: "Blacklist",
};

export function VehicleRcTool() {
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
      const res = await fetch(`/api/tools/vahan?vehicle=${encodeURIComponent(v)}`);
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "No vehicle details found");
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
          <CardTitle className="text-lg">Vehicle registration number</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-1">
              <Label htmlFor="vahan-vehicle" className="sr-only">
                Vehicle
              </Label>
              <Input
                id="vahan-vehicle"
                placeholder="e.g. UP32KH0320"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value.toUpperCase())}
                className="font-mono uppercase"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check RC"}
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Powered by ULIP / Vahan. Owner details may be partially masked as per government
            privacy rules. Not a substitute for the official Parivahan portal.
          </p>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {fields && Object.keys(fields).length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            {Object.entries(fields).map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-muted-foreground">{FIELD_LABELS[k] ?? k}</p>
                <p className="font-medium break-all">{v}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
