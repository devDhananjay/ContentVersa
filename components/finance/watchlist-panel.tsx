"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, Plus, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { displaySymbol, normalizeSymbol } from "@/lib/finance/transformers";
import type { StockQuote } from "@/lib/finance/types";
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

  async function addSymbol() {
    const sym = normalizeSymbol(input);
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

  if (loggedIn === null || loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

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

      <div className="flex gap-1.5">
        <Input
          placeholder="e.g. RELIANCE"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSymbol()}
          className="h-7 text-[11px]"
          disabled={adding}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={addSymbol}
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
