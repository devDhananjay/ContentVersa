"use client";

import * as React from "react";
import Link from "next/link";
import { Cloud, CloudRain, CloudSun, Loader2, MapPin, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** Weather snapshot — short TTL (hourly refresh like AccuWeather / weather.com). */
const WEATHER_KEY = "cv-nav-weather-v5";
/** Saved place from last GPS — long-lived; no re-prompt until user moves far. */
const LOC_KEY = "cv-nav-weather-loc-v5";
const SKIP_KEY = "cv-nav-weather-skip-geo";

const WEATHER_TTL_MS = 60 * 60 * 1000; // refresh conditions hourly
const LOC_RECHECK_MS = 6 * 60 * 60 * 1000; // silent GPS recheck at most every 6h
/** ~8 km — city-scale move; ignore GPS jitter / same-neighbourhood noise */
const MOVE_KM = 8;

type SavedLoc = {
  lat: number;
  lng: number;
  place: string;
  /** Last time we actually called getCurrentPosition */
  checkedAt: number;
};

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

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function readLoc(): SavedLoc | null {
  try {
    const raw = localStorage.getItem(LOC_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedLoc;
    if (typeof parsed?.lat !== "number" || typeof parsed?.lng !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLoc(loc: SavedLoc) {
  try {
    localStorage.setItem(LOC_KEY, JSON.stringify(loc));
  } catch {
    /* ignore quota */
  }
}

function readWeather(): WeatherCache | null {
  try {
    const raw = localStorage.getItem(WEATHER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeatherCache;
    if (!parsed?.place || typeof parsed.temp !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function weatherFresh(w: WeatherCache | null) {
  return !!w && Date.now() - w.at < WEATHER_TTL_MS;
}

function writeWeather(data: WeatherCache) {
  try {
    localStorage.setItem(WEATHER_KEY, JSON.stringify(data));
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

function migrateLegacyLoc(): SavedLoc | null {
  try {
    const v4 = localStorage.getItem("cv-nav-weather-v4");
    if (v4) {
      const parsed = JSON.parse(v4) as {
        lat?: number;
        lng?: number;
        place?: string;
        temp?: number;
        code?: number;
        at?: number;
      };
      if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
        const loc: SavedLoc = {
          lat: parsed.lat,
          lng: parsed.lng,
          place: parsed.place || "Near you",
          checkedAt: typeof parsed.at === "number" ? parsed.at : 0,
        };
        writeLoc(loc);
        if (parsed.place && typeof parsed.temp === "number" && typeof parsed.at === "number") {
          writeWeather({
            place: loc.place,
            temp: parsed.temp,
            code: Number(parsed.code ?? 0),
            at: parsed.at,
            lat: loc.lat,
            lng: loc.lng,
          });
        }
        localStorage.removeItem("cv-nav-weather-v4");
        return loc;
      }
    }
    localStorage.removeItem("cv-nav-weather-v3");
    localStorage.removeItem("cv-nav-weather-v4");
  } catch {
    /* ignore */
  }
  return null;
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
  const [needsOptIn, setNeedsOptIn] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  const fetchWeatherAt = React.useCallback(
    async (lat: number, lng: number, placeHint?: string) => {
      const res = await fetch(
        `/api/tools/weather?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`
      );
      const json = (await res.json()) as {
        error?: string;
        place?: { name?: string };
        current?: { temperature_2m?: number; weather_code?: number };
      };
      if (!res.ok || !json.current) throw new Error(json.error || "Failed");

      const place = json.place?.name || placeHint || "Near you";
      const next: WeatherCache = {
        place,
        temp: Math.round(Number(json.current.temperature_2m)),
        code: Number(json.current.weather_code ?? 0),
        at: Date.now(),
        lat,
        lng,
      };
      writeWeather(next);
      writeLoc({
        lat,
        lng,
        place,
        checkedAt: Date.now(),
      });
      setData(next);
      return next;
    },
    []
  );

  /** Weather-only refresh from saved coords — never touches GPS / permission. */
  const refreshWeatherFromSaved = React.useCallback(
    async (loc: SavedLoc) => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/tools/weather?lat=${encodeURIComponent(String(loc.lat))}&lng=${encodeURIComponent(String(loc.lng))}`
        );
        const json = (await res.json()) as {
          error?: string;
          place?: { name?: string };
          current?: { temperature_2m?: number; weather_code?: number };
        };
        if (!res.ok || !json.current) throw new Error(json.error || "Failed");

        const next: WeatherCache = {
          place: json.place?.name || loc.place || "Near you",
          temp: Math.round(Number(json.current.temperature_2m)),
          code: Number(json.current.weather_code ?? 0),
          at: Date.now(),
          lat: loc.lat,
          lng: loc.lng,
        };
        writeWeather(next);
        // Keep checkedAt — this is not a GPS recheck
        writeLoc({ ...loc, place: next.place });
        setData(next);
      } catch {
        /* keep last good chip */
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Silent GPS — only when browser already granted permission.
   * Updates saved place only if user moved ~8km+; otherwise just weather.
   * Does NOT call getCurrentPosition when state is "prompt" (no dialog spam).
   */
  const silentRecheckIfMoved = React.useCallback(
    (loc: SavedLoc) => {
      if (!navigator.geolocation) return;
      if (Date.now() - (loc.checkedAt || 0) < LOC_RECHECK_MS) return;

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const moved = haversineKm(loc.lat, loc.lng, lat, lng) >= MOVE_KM;
          try {
            if (moved) {
              await fetchWeatherAt(lat, lng);
            } else {
              writeLoc({ ...loc, checkedAt: Date.now() });
              if (!weatherFresh(readWeather())) {
                await refreshWeatherFromSaved({ ...loc, checkedAt: Date.now() });
              }
            }
          } catch {
            /* keep chip */
          }
        },
        () => {
          // Permission revoked mid-session — stop auto GPS; keep weather from saved coords
          writeSkipGeo();
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          // Prefer a recent fix when we do recheck; weather path uses saved coords
          maximumAge: 5 * 60 * 1000,
        }
      );
    },
    [fetchWeatherAt, refreshWeatherFromSaved]
  );

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
          writeSkipGeo();
          setNeedsOptIn(false);
          setHidden(true);
          setLoading(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: WEATHER_TTL_MS }
      );
    },
    [fetchWeatherAt]
  );

  React.useEffect(() => {
    const loc = readLoc() || migrateLegacyLoc();
    const cached = readWeather();

    // Show last known weather immediately (even if stale) — AccuWeather-style
    if (cached) setData(cached);

    if (loc) {
      setNeedsOptIn(false);
      if (!weatherFresh(cached)) {
        void refreshWeatherFromSaved(loc);
      }
      // Optional silent move-check only if already granted (no prompt)
      void (async () => {
        const permission = await queryGeoPermission();
        if (permission === "granted") silentRecheckIfMoved(loc);
      })();
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

      if (permission === "granted") {
        // First visit after grant but no saved loc yet — silent fix, no dialog
        requestLocation(false);
        return;
      }

      if (permission === "denied") {
        writeSkipGeo();
        setHidden(true);
        return;
      }

      // "prompt" / unsupported: wait for tap — never auto-prompt
      setNeedsOptIn(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshWeatherFromSaved, requestLocation, silentRecheckIfMoved]);

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
