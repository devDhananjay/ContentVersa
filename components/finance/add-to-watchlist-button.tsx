"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { displaySymbol, resolveFinanceSymbol } from "@/lib/finance/transformers";

interface AddToWatchlistButtonProps {
  symbol: string;
}

export function AddToWatchlistButton({ symbol }: AddToWatchlistButtonProps) {
  const [loggedIn, setLoggedIn] = React.useState<boolean | null>(null);
  const [inList, setInList] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const normalized = resolveFinanceSymbol(symbol);

  React.useEffect(() => {
    fetch("/api/finance/watchlist")
      .then((r) => r.json())
      .then((data: { loggedIn?: boolean; symbols?: string[] }) => {
        setLoggedIn(!!data.loggedIn);
        if (data.symbols) {
          setInList(data.symbols.includes(normalized));
        }
      })
      .catch(() => setLoggedIn(false));
  }, [normalized]);

  async function toggle() {
    if (!loggedIn) return;

    setLoading(true);
    try {
      if (inList) {
        const res = await fetch(
          `/api/finance/watchlist?symbol=${encodeURIComponent(normalized)}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error("Failed to remove");
        setInList(false);
        toast.success("Removed from watchlist");
      } else {
        const res = await fetch("/api/finance/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol: normalized }),
        });
        if (!res.ok) throw new Error("Failed to add");
        setInList(true);
        toast.success(`${displaySymbol(normalized)} added to watchlist`);
      }
    } catch {
      toast.error("Watchlist update failed");
    } finally {
      setLoading(false);
    }
  }

  if (loggedIn === null) return null;

  if (!loggedIn) {
    return (
      <Link href={`/auth/sign-in?next=/finance/stock/${displaySymbol(symbol)}`}>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Star className="h-3.5 w-3.5" /> Sign in to watchlist
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant={inList ? "secondary" : "outline"}
      size="sm"
      className="gap-1.5 h-8 text-xs"
      onClick={toggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Star className={`h-3.5 w-3.5 ${inList ? "fill-amber-400 text-amber-400" : ""}`} />
      )}
      {inList ? "Watching" : "Add to Watchlist"}
    </Button>
  );
}
