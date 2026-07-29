"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Gem,
  Fuel,
  Clapperboard,
  Star,
  ArrowUpDown,
} from "lucide-react";

interface GoldItem {
  city: string;
  gold24k: number;
  gold22k: number;
}

interface FuelItem {
  city: string;
  petrol: number;
  diesel: number;
}

interface MovieItem {
  id: string;
  title: string;
  meta?: string;
  image?: string;
  externalUrl?: string;
}

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function MarqueeRow({
  children,
  speed = 35,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  return (
    <div className={`relative min-w-0 flex-1 overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-background to-transparent" />
      <div
        className="flex w-max items-center gap-3 hover:[animation-play-state:paused]"
        style={{
          animation: `marquee ${speed}s linear infinite`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function GoldStrip() {
  const [items, setItems] = useState<GoldItem[]>([]);

  useEffect(() => {
    fetch("/api/strips/gold")
      .then((r) => r.json())
      .then((d) => { if (d?.items?.length) setItems(d.items); })
      .catch(() => {});
  }, []);

  if (!items.length) return null;
  const loop = [...items, ...items];

  return (
    <div className="flex items-center gap-3 py-2.5">
      <Link
        href="/goldverse"
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-black"
      >
        <Gem className="h-3.5 w-3.5" />
        Gold
      </Link>
      <MarqueeRow speed={30}>
        {loop.map((g, i) => (
          <Link
            key={`${g.city}-${i}`}
            href="/goldverse"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/50 bg-card/80 px-3 py-1.5 text-xs transition hover:border-yellow-400/50 hover:bg-yellow-500/10"
          >
            <span className="font-bold">{g.city}</span>
            <span className="text-yellow-400">{fmt(g.gold24k)}</span>
            <span className="text-[10px] text-muted-foreground">24K</span>
            <span className="text-yellow-300/70">{fmt(g.gold22k)}</span>
            <span className="text-[10px] text-muted-foreground">22K</span>
          </Link>
        ))}
      </MarqueeRow>
    </div>
  );
}

function FuelStrip() {
  const [items, setItems] = useState<FuelItem[]>([]);

  useEffect(() => {
    fetch("/api/strips/fuel")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d) && d.length) setItems(d); })
      .catch(() => {});
  }, []);

  if (!items.length) return null;
  const loop = [...items, ...items];

  return (
    <div className="flex items-center gap-3 py-2.5">
      <Link
        href="/tools/fuel-price"
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
      >
        <Fuel className="h-3.5 w-3.5" />
        Fuel
      </Link>
      <MarqueeRow speed={28}>
        {loop.map((f, i) => (
          <Link
            key={`${f.city}-${i}`}
            href="/tools/fuel-price"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/50 bg-card/80 px-3 py-1.5 text-xs transition hover:border-sky-400/50 hover:bg-sky-500/10"
          >
            <span className="font-bold">{f.city}</span>
            <ArrowUpDown className="h-3 w-3 text-sky-400" />
            <span className="text-green-400">⛽ {fmt(f.petrol)}</span>
            <span className="text-[10px] text-muted-foreground">Petrol</span>
            <span className="text-blue-400">{fmt(f.diesel)}</span>
            <span className="text-[10px] text-muted-foreground">Diesel</span>
          </Link>
        ))}
      </MarqueeRow>
    </div>
  );
}

function MoviesStrip() {
  const [items, setItems] = useState<MovieItem[]>([]);

  useEffect(() => {
    fetch("/api/strips/movies")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d) && d.length) setItems(d); })
      .catch(() => {});
  }, []);

  if (!items.length) return null;
  const loop = [...items, ...items];

  return (
    <div className="flex items-center gap-3 py-2.5">
      <Link
        href="/cineverse"
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
      >
        <Clapperboard className="h-3.5 w-3.5" />
        Movies
      </Link>
      <MarqueeRow speed={32}>
        {loop.map((m, i) => (
          <Link
            key={`${m.id}-${i}`}
            href={`/cineverse`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border/50 bg-card/80 px-3 py-1.5 text-xs transition hover:border-purple-400/50 hover:bg-purple-500/10"
          >
            <Clapperboard className="h-3 w-3 text-purple-400" />
            <span className="max-w-[180px] truncate font-semibold">{m.title}</span>
            {m.meta && (
              <span className="flex items-center gap-0.5 text-yellow-400">
                <Star className="h-2.5 w-2.5 fill-yellow-400" />
                {m.meta.replace("★ ", "")}
              </span>
            )}
          </Link>
        ))}
      </MarqueeRow>
    </div>
  );
}

export function InfoStrips() {
  return (
    <section
      id="info-strips"
      className="border-y border-border/40 bg-muted/10"
    >
      <div className="container divide-y divide-border/30">
        <GoldStrip />
        <FuelStrip />
        <MoviesStrip />
      </div>
    </section>
  );
}
