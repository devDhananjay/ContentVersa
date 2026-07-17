"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import type { PlaceCategory } from "@/lib/tools/places";
import { PLACE_CATEGORY_META } from "@/lib/tools/places";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Place = {
  name: string;
  address?: string;
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
  distanceKm?: number;
  mapsUrl?: string;
};

export function NearbyPlacesTool({
  defaultCategory = "places",
  defaultCity,
  autoSearch = false,
}: {
  defaultCategory?: PlaceCategory;
  defaultCity?: string;
  autoSearch?: boolean;
}) {
  const [category, setCategory] = React.useState<PlaceCategory>(defaultCategory);
  const [location, setLocation] = React.useState(defaultCity || "Connaught Place, Delhi");
  const [radius, setRadius] = React.useState("3000");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [places, setPlaces] = React.useState<Place[]>([]);
  const [centerLabel, setCenterLabel] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  React.useEffect(() => {
    if (defaultCity) setLocation(defaultCity);
  }, [defaultCity]);

  React.useEffect(() => {
    if (autoSearch && defaultCity) {
      void search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSearch, defaultCity, category]);

  async function search(opts?: { lat?: number; lng?: number }) {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ category });
      if (opts?.lat != null && opts?.lng != null) {
        qs.set("lat", String(opts.lat));
        qs.set("lng", String(opts.lng));
      } else {
        qs.set("location", location.trim());
      }
      qs.set("radius", radius);
      const res = await fetch(`/api/tools/nearby?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setPlaces(json.places || []);
      setCenterLabel(json.center?.address || (opts ? "Your location" : location));
    } catch (err) {
      setPlaces([]);
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  function nearMe() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void search({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setLoading(false);
        setError(err.message || "Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Nearby {PLACE_CATEGORY_META[category]?.label || "Places"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {defaultCategory === "places" ? (
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PLACE_CATEGORY_META) as PlaceCategory[]).map((c) => (
                <Button
                  key={c}
                  type="button"
                  size="sm"
                  variant={category === c ? "default" : "outline"}
                  onClick={() => setCategory(c)}
                >
                  {PLACE_CATEGORY_META[c].label}
                </Button>
              ))}
            </div>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
            <div className="space-y-1">
              <Label htmlFor="nearby-location">Location / area / city</Label>
              <Input
                id="nearby-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Civil Lines Bareilly, Connaught Place Delhi…"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nearby-radius">Radius</Label>
              <select
                id="nearby-radius"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              >
                <option value="1000">1 km</option>
                <option value="3000">3 km</option>
                <option value="5000">5 km</option>
                <option value="10000">10 km</option>
                <option value="20000">20 km</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={loading || !location.trim()} onClick={() => void search()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search nearby"}
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={nearMe}>
              Near me
            </Button>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {centerLabel ? (
            <p className="text-xs text-muted-foreground">Around: {centerLabel}</p>
          ) : null}
        </CardContent>
      </Card>

      {places.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Results ({places.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {places.map((p) => (
              <div key={`${p.name}-${p.address}`} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{p.name}</p>
                {p.address ? <p className="mt-1 text-muted-foreground">{p.address}</p> : null}
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {p.rating != null ? (
                    <span>
                      ★ {p.rating}
                      {p.userRatingsTotal != null ? ` (${p.userRatingsTotal})` : ""}
                    </span>
                  ) : null}
                  {p.distanceKm != null ? <span>{p.distanceKm} km away</span> : null}
                  {p.openNow != null ? <span>{p.openNow ? "Open now" : "Closed"}</span> : null}
                  {p.mapsUrl ? (
                    <a
                      href={p.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Open in Maps
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Powered by Google Places. Distance is approximate straight-line distance from your selected
        location; route distance can differ.
      </p>
    </div>
  );
}
