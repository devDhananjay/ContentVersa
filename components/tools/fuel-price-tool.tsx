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
  const [results, setResults] = React.useState<CityFuelPrice[]>([]);
  const [selected, setSelected] = React.useState<CityFuelPrice | null>(null);
  const skipSearchRef = React.useRef(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tools/fuel-price?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        const list: CityFuelPrice[] = data.results ?? [];
        setResults(list);
        // Auto-show first match so prices appear without an extra click
        if (list.length === 1) {
          setSelected(list[0]);
        } else if (list.length > 1) {
          const exact = list.find(
            (c) => c.city.toLowerCase() === q.toLowerCase().split(",")[0].trim()
          );
          setSelected(exact ?? list[0]);
        } else {
          setSelected(null);
        }
      } catch {
        setResults([]);
        setSelected(null);
        toast.error("Could not load fuel prices");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function pickCity(city: CityFuelPrice) {
    skipSearchRef.current = true;
    setSelected(city);
    setQuery(city.city);
    setResults([city]);
  }

  function searchCity(name: string) {
    setSelected(null);
    setQuery(name);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search city</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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

          <div className="flex flex-wrap gap-2">
            {["Delhi", "Mumbai", "Bangalore", "Chennai", "Pune", "Hyderabad"].map((city) => (
              <Button
                key={city}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => searchCity(city)}
              >
                {city}
              </Button>
            ))}
          </div>

          {results.length > 1 ? (
            <ul className="rounded-lg border border-border/60 divide-y max-h-48 overflow-y-auto">
              {results.map((s) => {
                const petrol = s.rates.find((r) => r.fuel === "Petrol")?.price;
                const diesel = s.rates.find((r) => r.fuel === "Diesel")?.price;
                const active =
                  selected?.city === s.city && selected?.state === s.state;
                return (
                  <li key={`${s.city}-${s.state}`}>
                    <button
                      type="button"
                      className={`w-full px-3 py-2.5 text-left text-sm hover:bg-muted/50 ${
                        active ? "bg-primary/10" : ""
                      }`}
                      onClick={() => pickCity(s)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>
                          <span className="font-medium">{s.city}</span>
                          <span className="text-muted-foreground"> · {s.state}</span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                          {petrol != null ? `P ₹${petrol.toFixed(2)}` : ""}
                          {petrol != null && diesel != null ? " · " : ""}
                          {diesel != null ? `D ₹${diesel.toFixed(2)}` : ""}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      {selected ? (
        <Card className="border-primary/30">
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
                className="rounded-lg border border-border/60 bg-muted/20 p-4 text-center"
              >
                <p className="text-sm text-muted-foreground">{r.fuel}</p>
                <p className="text-3xl font-bold text-primary">₹{r.price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">per litre</p>
              </div>
            ))}
          </CardContent>
          {selected.source || selected.date ? (
            <p className="px-6 pb-4 text-xs text-muted-foreground">
              {selected.source ? `${selected.source}. ` : ""}
              {selected.date ? `As of ${selected.date}. ` : ""}
              Prices vary by outlet — confirm locally before purchase.
            </p>
          ) : null}
        </Card>
      ) : query.trim().length >= 2 && !loading ? (
        <p className="text-sm text-muted-foreground">
          No fuel prices found for “{query.trim()}”. Try Delhi, Mumbai, or Pune.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Type a city name or tap a quick city above to see today’s petrol & diesel rates.
        </p>
      )}
    </div>
  );
}
