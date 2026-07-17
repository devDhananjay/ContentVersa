"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CityFuelPrice } from "@/lib/tools/fuel-price";

export function FuelPriceTool() {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<CityFuelPrice[]>([]);
  const [selected, setSelected] = React.useState<CityFuelPrice | null>(null);

  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tools/fuel-price?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSuggestions(data.results ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function loadCity(city: string, state: string) {
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch(
        `/api/tools/fuel-price?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`
      );
      const data = await res.json();
      if (!data.ok) {
        toast.error("City not found in fuel data");
        return;
      }
      setSelected(data.data);
      setQuery(`${city}, ${state}`);
      setSuggestions([]);
    } catch {
      toast.error("Could not load fuel prices");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search city</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="fuel-city" className="sr-only">
            City
          </Label>
          <div className="relative">
            <Input
              id="fuel-city"
              placeholder="e.g. Mumbai, Delhi, Pune"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
              }}
            />
            {loading ? (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            ) : null}
          </div>
          {suggestions.length > 0 ? (
            <ul className="rounded-lg border border-border/60 divide-y">
              {suggestions.map((s) => (
                <li key={`${s.city}-${s.state}`}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50"
                    onClick={() => loadCity(s.city, s.state)}
                  >
                    <span className="font-medium">{s.city}</span>
                    <span className="text-muted-foreground"> · {s.state}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      {selected ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {selected.city}, {selected.state}
            </CardTitle>
            {selected.date ? (
              <p className="text-xs text-muted-foreground">Data date: {selected.date}</p>
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {selected.rates.map((r) => (
              <div
                key={r.fuel}
                className="rounded-lg border border-border/60 p-4 text-center"
              >
                <p className="text-sm text-muted-foreground">{r.fuel}</p>
                <p className="text-2xl font-bold text-primary">₹{r.price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">per litre</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-2">
          {["Mumbai", "Delhi", "Bangalore", "Chennai", "Pune"].map((city) => (
            <Button
              key={city}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuery(city)}
            >
              {city}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
