"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GeoLocationTool() {
  const [lat, setLat] = React.useState("");
  const [lng, setLng] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported in this browser");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
        setLoading(false);
        void reverse(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setLoading(false);
        setError(err.message || "Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function reverse(la: number, ln: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tools/geocode?lat=${la}&lng=${ln}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setAddress(json.displayName || null);
    } catch (err) {
      setAddress(null);
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find geo location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="button" onClick={useMyLocation} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Use my current location"}
          </Button>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="lat">Latitude</Label>
              <Input id="lat" value={lat} onChange={(e) => setLat(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lng">Longitude</Label>
              <Input id="lng" value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={loading || !lat || !lng}
            onClick={() => void reverse(Number(lat), Number(lng))}
          >
            Reverse geocode address
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {address ? (
            <div className="rounded-lg border bg-muted/20 p-3 text-sm">
              <p className="font-medium">Address</p>
              <p className="mt-1 text-muted-foreground">{address}</p>
              <p className="mt-2 font-mono text-xs">
                {lat}, {lng}
              </p>
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Browser GPS + OpenStreetMap Nominatim (free). No Google key needed for this tool.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
