"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Loader2, LogIn, Plus, Search, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { displaySymbol, resolveFinanceSymbol } from "@/lib/finance/transformers";
import type { StockQuote } from "@/lib/finance/types";
import type { StockSearchResult } from "@/lib/finance/stock-search";
import { ChangeBadge } from "./change-badge";

interface WatchlistPanelProps {
  defaultQuotes?: StockQuote[];
}

export function WatchlistPanel({ defaultQuotes = [] }: WatchlistPanelProps) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = React.useState<boolean | null>(null);
  const [symbols, setSymbols] = React.useState<string[]>([]);
  const [quotes, setQuotes] = React.useState<StockQuote[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [results, setResults] = React.useState<StockSearchResult[]>([]);
  const [open, setOpen] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  const loadWatchlist = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance/watchlist");
      const data = (await res.json()) as {
        loggedIn?: boolean;
        symbols?: string[];
        quotes?: StockQuote[];
      };
      setLoggedIn(!!data.loggedIn);
      if (data.loggedIn) {
        setSymbols(data.symbols ?? []);
        setQuotes(data.quotes ?? []);
      } else {
        setQuotes(defaultQuotes);
      }
    } catch {
      setLoggedIn(false);
      setQuotes(defaultQuotes);
    } finally {
      setLoading(false);
    }
  }, [defaultQuotes]);

  React.useEffect(() => {
    void loadWatchlist();
  }, [loadWatchlist]);

  React.useEffect(() => {
    const q = input.trim();
    if (q.length < 1) {
      setResults([]);
      setSearching(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/finance/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { results?: StockSearchResult[] };
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [input]);

  React.useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!searchRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  async function addSymbol(symbolInput?: string) {
    const sym = resolveFinanceSymbol(symbolInput ?? input);
    if (!sym) return;

    if (!loggedIn) {
      router.push("/auth/sign-in?next=/finance");
      return;
    }

    if (symbols.includes(sym)) {
      toast.info("Already in watchlist");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/finance/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: sym }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add");
      setSymbols(data.symbols ?? []);
      setQuotes(data.quotes ?? []);
      setInput("");
      setResults([]);
      setOpen(false);
      toast.success(`${displaySymbol(sym)} added to watchlist`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add stock");
    } finally {
      setAdding(false);
    }
  }

  async function removeSymbol(sym: string) {
    if (!loggedIn) return;
    try {
      const res = await fetch(
        `/api/finance/watchlist?symbol=${encodeURIComponent(sym)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to remove");
      setSymbols(data.symbols ?? []);
      setQuotes(data.quotes ?? []);
      toast.success("Removed from watchlist");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove");
    }
  }

  function pickResult(row: StockSearchResult) {
    void addSymbol(row.symbol);
  }

  if (loggedIn === null || loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  const filteredResults = results.filter((r) => !symbols.includes(r.symbol));

  return (
    <div className="space-y-2.5">
      {!loggedIn && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-2 text-[10px] text-muted-foreground">
          <Link
            href="/auth/sign-in?next=/finance"
            className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium hover:underline"
          >
            <LogIn className="h-3 w-3" /> Sign in
          </Link>{" "}
          to save your watchlist
        </div>
      )}

      {loggedIn && (
        <div className="flex items-start gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/5 px-2.5 py-2 text-[10px] text-muted-foreground leading-relaxed">
          <Bell className="h-3 w-3 text-sky-500 shrink-0 mt-0.5" />
          <span>
            You&apos;ll receive email and notifications when your favorite stocks{" "}
            <strong>open</strong> and <strong>close</strong> each trading day — including
            the opening and closing prices.
          </span>
        </div>
      )}

      <div className="flex gap-1.5" ref={searchRef}>
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search stock e.g. RELIANCE, TCS…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOpen(true);
            }}
            onFocus={() => input.trim() && setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (filteredResults[0]) pickResult(filteredResults[0]);
                else void addSymbol();
              }
              if (e.key === "Escape") setOpen(false);
            }}
            className="h-7 text-[11px] pl-7 pr-7"
            disabled={adding}
            autoComplete="off"
          />
          {searching && (
            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-muted-foreground" />
          )}

          {open && input.trim().length > 0 && !searching && (
            <ul className="absolute z-20 left-0 right-0 top-full mt-1 max-h-40 overflow-y-auto rounded-md border border-border/60 bg-popover shadow-md">
              {filteredResults.length === 0 ? (
                <li className="px-2.5 py-2 text-[10px] text-muted-foreground">
                  No Nifty 50 match for &quot;{input.trim()}&quot;
                </li>
              ) : (
                filteredResults.map((row) => (
                  <li key={row.symbol}>
                    <button
                      type="button"
                      onClick={() => pickResult(row)}
                      className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px] hover:bg-muted/60"
                    >
                      <span className="font-medium">{row.label}</span>
                      {row.hint ? (
                        <span className="text-[9px] text-muted-foreground truncate">
                          {row.hint}
                        </span>
                      ) : null}
                      <span className="text-[9px] text-muted-foreground ml-auto shrink-0">
                        NSE
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => void addSymbol()}
          disabled={adding || !input.trim()}
          className="shrink-0 h-7 px-2"
        >
          {adding ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {quotes.length === 0 ? (
        <p className="text-[10px] text-muted-foreground text-center py-6">
          {loggedIn ? "Add stocks to your watchlist" : "Sign in to build your watchlist"}
        </p>
      ) : (
        <ul className="space-y-0.5 max-h-[220px] overflow-y-auto">
          {quotes.map((q) => (
            <li
              key={q.symbol}
              className="flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-muted/40 group"
            >
              <Link
                href={`/finance/stock/${displaySymbol(q.symbol)}`}
                className="flex items-center gap-1.5 min-w-0 flex-1 text-[11px]"
              >
                <Star className="h-2.5 w-2.5 text-amber-500 shrink-0 fill-amber-500/30" />
                <span className="font-medium truncate">{displaySymbol(q.symbol)}</span>
                <span className="text-muted-foreground tabular-nums ml-auto shrink-0">
                  ₹{q.price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
                <ChangeBadge change={q.change} changePercent={q.changePercent} size="xs" />
              </Link>
              {loggedIn && (
                <button
                  type="button"
                  onClick={() => removeSymbol(q.symbol)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground p-0.5 shrink-0"
                  aria-label={`Remove ${q.symbol}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
