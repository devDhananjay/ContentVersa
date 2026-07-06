"use client";

import * as React from "react";
import {
  Calculator,
  IndianRupee,
  Info,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GOLD_CARATS,
  GOLD_PRICE_SOURCE_NOTE,
  calculateGoldAmount,
  perGram,
  ratePer10gFromRow,
  searchGoldCities,
  type GoldCaratId,
} from "@/lib/goldverse/gold-utils";
import type { GoldPriceSnapshot, GoldRateRow } from "@/lib/goldverse/types";
import { cn } from "@/lib/utils";

function formatInr(n: number) {
  return n.toLocaleString("en-IN");
}

export function GoldPriceHub({ initial }: { initial: GoldPriceSnapshot }) {
  const [data, setData] = React.useState(initial);
  const [loading, setLoading] = React.useState(false);
  const [cityQuery, setCityQuery] = React.useState("");
  const [selectedCity, setSelectedCity] = React.useState<GoldRateRow | null>(() => {
    const mumbai = initial.rates.find((r) => r.city.toLowerCase() === "mumbai");
    return mumbai ?? initial.rates[0] ?? null;
  });
  const [carat, setCarat] = React.useState<GoldCaratId>("22k");
  const [grams, setGrams] = React.useState("10");

  const filtered = React.useMemo(
    () => searchGoldCities(data.rates, cityQuery),
    [data.rates, cityQuery]
  );

  const caratMeta = GOLD_CARATS.find((c) => c.id === carat) ?? GOLD_CARATS[1];
  const ratePer10g = selectedCity
    ? ratePer10gFromRow(selectedCity, carat)
    : 0;
  const weight = parseFloat(grams) || 0;
  const total = calculateGoldAmount(ratePer10g, weight);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/goldverse/gold-price");
      if (res.ok) {
        const next = (await res.json()) as GoldPriceSnapshot;
        setData(next);
        if (selectedCity) {
          const match = next.rates.find(
            (r) => r.city.toLowerCase() === selectedCity.city.toLowerCase()
          );
          if (match) setSelectedCity(match);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function pickCity(row: GoldRateRow) {
    setSelectedCity(row);
    setCityQuery(row.city);
  }

  const updated = new Date(data.updatedAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const sourceNote = GOLD_PRICE_SOURCE_NOTE[data.source];

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-card to-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
              <IndianRupee className="h-3.5 w-3.5" />
              Gold price today
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Per 10g · {updated}
              {data.source !== "5paisa" ? (
                <>
                  {" · "}
                  <span
                    className={
                      data.source === "indicative"
                        ? "text-amber-300"
                        : "text-emerald-400"
                    }
                  >
                    {data.source === "yahoo"
                      ? "Yahoo Finance"
                      : data.source === "api"
                        ? "Live API"
                        : "Offline"}
                  </span>
                </>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 px-3 py-1 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/10"
          >
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
            Refresh
          </button>
        </div>

        {data.source !== "5paisa" ? (
          <div className="mt-3 flex gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
            <p>
              <strong className="text-foreground">Source:</strong> {sourceNote}
              {data.source === "indicative" ? (
                <>
                  {" "}
                  Yahoo Finance temporarily unavailable — showing offline benchmarks.
                </>
              ) : data.source === "yahoo" ? (
                <>
                  {" "}
                  Formula: COMEX gold (GC=F) × USD/INR, converted to ₹/10g 24K.
                </>
              ) : null}
            </p>
          </div>
        ) : null}

        {selectedCity ? (
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">22K / gram</p>
              <p className="font-display text-lg font-bold text-amber-200">
                ₹{formatInr(perGram(selectedCity.gold22k))}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">22K / 10g</p>
              <p className="font-display text-lg font-bold">
                ₹{formatInr(selectedCity.gold22k)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">24K / gram</p>
              <p className="font-display text-lg font-bold">
                ₹{formatInr(perGram(selectedCity.gold24k))}
              </p>
            </div>
          </div>
        ) : null}

        <div className="relative mt-4">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            placeholder="Search city — Mumbai, Delhi, Jaipur…"
            className="h-11 pl-9"
            list="gold-cities-list"
          />
          <datalist id="gold-cities-list">
            {data.rates.map((r) => (
              <option key={r.city} value={r.city} />
            ))}
          </datalist>
        </div>

        {cityQuery && filtered.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No city matched “{cityQuery}”. Try Mumbai, Delhi, Chennai…
          </p>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {(cityQuery ? filtered : data.rates).slice(0, cityQuery ? 12 : 10).map((row) => (
            <button
              key={row.city}
              type="button"
              onClick={() => pickCity(row)}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                selectedCity?.city === row.city
                  ? "border-amber-400/60 bg-amber-500/15 ring-1 ring-amber-400/30"
                  : "border-border/50 bg-card/70 hover:border-amber-500/30"
              )}
            >
              <p className="text-xs font-bold text-amber-200">{row.city}</p>
              <p className="mt-2 text-[10px] uppercase text-muted-foreground">22K / gram</p>
              <p className="font-display text-sm font-bold">₹{formatInr(perGram(row.gold22k))}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                22K /10g ₹{formatInr(row.gold22k)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {selectedCity ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/50 p-5 md:p-6">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Search className="h-3.5 w-3.5" />
              {selectedCity.city} — today&apos;s rates
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {GOLD_CARATS.map((c) => {
                const rate10 = ratePer10gFromRow(selectedCity, c.id);
                return (
                  <div
                    key={c.id}
                    className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2"
                  >
                    <dt className="text-xs font-bold">{c.label}</dt>
                    <dd className="text-[10px] text-muted-foreground">{c.subtitle}</dd>
                    <dd className="mt-1 font-display text-sm font-bold">
                      ₹{formatInr(perGram(rate10))}
                      <span className="text-[10px] font-normal text-muted-foreground">/g</span>
                    </dd>
                    <dd className="text-[10px] text-muted-foreground">
                      ₹{formatInr(rate10)} / 10g
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/20 to-card p-5 md:p-6">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Calculator className="h-3.5 w-3.5" />
              Gold price calculator
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedCity.city} · carat + weight → estimated value
            </p>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Carat / purity</Label>
                <div className="flex flex-wrap gap-2">
                  {GOLD_CARATS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCarat(c.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        carat === c.id
                          ? "border-amber-400/50 bg-amber-500/20 text-amber-100"
                          : "border-border/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gold-grams" className="text-xs">
                  Weight (grams)
                </Label>
                <Input
                  id="gold-grams"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Estimated value
                </p>
                <p className="font-display text-3xl font-bold text-amber-300">
                  ₹{formatInr(total)}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {caratMeta.label} ({caratMeta.subtitle}) · ₹
                  {formatInr(Math.round(ratePer10g / 10))}/g · {weight || 0}g
                </p>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Excludes making charges, GST & wastage — jewellery shop final bill
                  may differ.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
