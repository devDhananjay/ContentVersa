"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  tmdbId: string;
  title?: string;
  className?: string;
  size?: "sm" | "icon";
};

export function AddToMovieWatchlistButton({
  tmdbId,
  title,
  className,
  size = "sm",
}: Props) {
  const [loggedIn, setLoggedIn] = React.useState<boolean | null>(null);
  const [inList, setInList] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/cineverse/watchlist")
      .then((r) => r.json())
      .then((data: { loggedIn?: boolean; ids?: string[] }) => {
        setLoggedIn(!!data.loggedIn);
        if (data.ids) setInList(data.ids.includes(tmdbId));
      })
      .catch(() => setLoggedIn(false));
  }, [tmdbId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn) return;

    setLoading(true);
    try {
      if (inList) {
        const res = await fetch(
          `/api/cineverse/watchlist?tmdbId=${encodeURIComponent(tmdbId)}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error("Failed");
        setInList(false);
        toast.success("Removed from watchlist");
        window.dispatchEvent(new CustomEvent("cineverse-watchlist-changed"));
      } else {
        const res = await fetch("/api/cineverse/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId }),
        });
        if (!res.ok) throw new Error("Failed");
        setInList(true);
        toast.success(title ? `${title} saved` : "Added to watchlist");
        window.dispatchEvent(new CustomEvent("cineverse-watchlist-changed"));
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
      <Link
        href={`/auth/sign-in?next=/cineverse`}
        onClick={(e) => e.stopPropagation()}
        className={className}
      >
        <Button variant="outline" size={size} className="gap-1.5 h-8 text-xs">
          <Star className="h-3.5 w-3.5" /> Watchlist
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant={inList ? "secondary" : "outline"}
      size={size}
      className={cn("gap-1.5 h-8 text-xs", className)}
      onClick={toggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Star className={cn("h-3.5 w-3.5", inList && "fill-amber-400 text-amber-400")} />
      )}
      {inList ? "Saved" : "Watchlist"}
    </Button>
  );
}
