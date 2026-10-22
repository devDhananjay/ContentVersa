"use client";

import * as React from "react";
import Link from "next/link";
import { Cloud, CloudRain, CloudSun, Loader2, MapPin, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** Bump when place-name logic changes so sticky wrong cities refresh. */
const CACHE_KEY = "cv-nav-weather-v4";
const SKIP_KEY = "cv-nav-weather-skip-geo";
const CACHE_MS = 45 * 60 * 1000;

type WeatherCache = {
  place: string;
  temp: number;
  code: number;
  at: number;
  lat: number;
  lng: number;
};

function weatherIcon(code: number) {
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
    return CloudRain;
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return Cloud;
  }
  if ([0, 1].includes(code)) {
    return Sun;
  }
  if ([2].includes(code)) {
    return CloudSun;
  }
  return Cloud;
}

function shortPlace(name: string) {
  const cleaned = name.split(",")[0]?.trim() || name;
  return cleaned.length > 14 ? `${cleaned.slice(0, 13)}…` : cleaned;
}

function readCache(): WeatherCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeatherCache;
    if (!parsed?.place || typeof parsed.temp !== "number") return null;
    if (Date.now() - parsed.at > CACHE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data: WeatherCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}

function readSkipGeo(): boolean {
  try {
    return localStorage.getItem(SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSkipGeo() {
  try {
    localStorage.setItem(SKIP_KEY, "1");
  } catch {
    /* ignore */
  }
}

async function queryGeoPermission(): Promise<PermissionState | "unsupported"> {
  try {
    if (!navigator.permissions?.query) return "unsupported";
    const status = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    });
    return status.state;
  } catch {
    return "unsupported";
  }
}

export function NavWeatherChip({
  immersive = false,
  className,
}: {
  immersive?: boolean;
  className?: string;
}) {
  const [data, setData] = React.useState<WeatherCache | null>(null);
  const [loading, setLoading] = React.useState(false);
  /** Show opt-in chip instead of auto browser prompt. */
  const [needsOptIn, setNeedsOptIn] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  const fetchWeatherAt = React.useCallback(async (lat: number, lng: number) => {
    const res = await fetch(
      `/api/tools/weather?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`
    );
    const json = (await res.json()) as {
      error?: string;
      place?: { name?: string };
      current?: { temperature_2m?: number; weather_code?: number };
    };
    if (!res.ok || !json.current) throw new Error(json.error || "Failed");

    const next: WeatherCache = {
      place: json.place?.name || "Near you",
      temp: Math.round(Number(json.current.temperature_2m)),
      code: Number(json.current.weather_code ?? 0),
      at: Date.now(),
      lat,
      lng,
    };
    writeCache(next);
    setData(next);
  }, []);

  const requestLocation = React.useCallback(
    (fromUserGesture: boolean) => {
      if (!navigator.geolocation) {
        if (fromUserGesture) writeSkipGeo();
        setHidden(true);
        return;
      }

      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await fetchWeatherAt(pos.coords.latitude, pos.coords.longitude);
            setNeedsOptIn(false);
          } catch {
            if (fromUserGesture) writeSkipGeo();
            setHidden(true);
          } finally {
            setLoading(false);
          }
        },
        () => {
          // Denied or dismissed — never auto-prompt again this browser.
          writeSkipGeo();
          setNeedsOptIn(false);
          setHidden(true);
          setLoading(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: CACHE_MS }
      );
    },
    [fetchWeatherAt]
  );

  React.useEffect(() => {
    try {
      localStorage.removeItem("cv-nav-weather-v3");
    } catch {
      /* ignore */
    }

    const cached = readCache();
    if (cached) {
      setData(cached);
      return;
    }

    if (readSkipGeo()) {
      setHidden(true);
      return;
    }

    if (!navigator.geolocation) {
      setHidden(true);
      return;
    }

    let cancelled = false;

    (async () => {
      const permission = await queryGeoPermission();
      if (cancelled) return;

      // Already allowed earlier — refresh silently (no new prompt).
      if (permission === "granted") {
        requestLocation(false);
        return;
      }

      // Denied in browser settings — stay quiet.
      if (permission === "denied") {
        writeSkipGeo();
        setHidden(true);
        return;
      }

      // "prompt" or unsupported: do NOT auto-call getCurrentPosition
      // (that re-opens the permission dialog on every page load).
      setNeedsOptIn(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [requestLocation]);

  if (hidden && !data) return null;

  if (loading && !data) {
    return (
      <span
        className={cn(
          "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11px]",
          immersive
            ? "border-white/15 bg-white/10 text-white/70"
            : "border-border/50 bg-muted/40 text-muted-foreground",
          className
        )}
        aria-label="Loading weather"
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>…</span>
      </span>
    );
  }

  if (needsOptIn && !data) {
    return (
      <button
        type="button"
        onClick={() => requestLocation(true)}
        title="Show local weather (asks location once)"
        aria-label="Enable local weather"
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
          immersive
            ? "border-white/15 bg-white/10 text-white/90 hover:bg-white/15"
            : "border-border/50 bg-muted/40 text-muted-foreground hover:border-sky-500/35 hover:bg-sky-500/10 hover:text-foreground",
          className
        )}
      >
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span>Weather</span>
      </button>
    );
  }

  if (!data) return null;

  const Icon = weatherIcon(data.code);
  const label = `${data.place} · ${data.temp}°C`;

  return (
    <Link
      href="/tools/weather"
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        immersive
          ? "border-white/15 bg-white/10 text-white/90 hover:bg-white/15"
          : "border-border/50 bg-muted/40 text-muted-foreground hover:border-sky-500/35 hover:bg-sky-500/10 hover:text-foreground",
        className
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          Icon === Sun
            ? "text-amber-400"
            : Icon === CloudRain
              ? "text-sky-400"
              : immersive
                ? "text-white/80"
                : "text-sky-500/90"
        )}
      />
      <span className="max-w-[5.5rem] truncate sm:max-w-[6.5rem]">{shortPlace(data.place)}</span>
      <span className={cn("shrink-0 tabular-nums", immersive ? "text-white" : "text-foreground")}>
        {data.temp}°
      </span>
    </Link>
  );
}
