"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WMO: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  80: "Rain showers",
  95: "Thunderstorm",
};

export function WeatherTool() {
  const [city, setCity] = React.useState("Delhi");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<{
    place: { name: string; region?: string };
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      weather_code: number;
      wind_speed_10m: number;
    };
    daily: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_sum: number[];
      weather_code: number[];
    };
  } | null>(null);

  async function lookup(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tools/weather?city=${encodeURIComponent(city.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setData(json);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void lookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weather by city (India)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={lookup} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="weather-city">City</Label>
              <Input
                id="weather-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Delhi, Mumbai, Bareilly…"
              />
            </div>
            <Button type="submit" disabled={loading || !city.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check weather"}
            </Button>
          </form>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      {data ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {data.place.name}
                {data.place.region ? `, ${data.place.region}` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
              <p>
                <span className="text-muted-foreground">Condition · </span>
                {WMO[data.current.weather_code] || `Code ${data.current.weather_code}`}
              </p>
              <p>
                <span className="text-muted-foreground">Temp · </span>
                {data.current.temperature_2m}°C
              </p>
              <p>
                <span className="text-muted-foreground">Humidity · </span>
                {data.current.relative_humidity_2m}%
              </p>
              <p>
                <span className="text-muted-foreground">Wind · </span>
                {data.current.wind_speed_10m} km/h
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">7-day forecast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.daily.time.map((day, i) => (
                <div
                  key={day}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{day}</span>
                  <span className="text-muted-foreground">
                    {WMO[data.daily.weather_code[i]] || "—"}
                  </span>
                  <span>
                    {data.daily.temperature_2m_min[i]}° / {data.daily.temperature_2m_max[i]}°
                  </span>
                  <span className="text-muted-foreground">
                    Rain {data.daily.precipitation_sum[i]} mm
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}
      <p className="text-xs text-muted-foreground">Data via Open-Meteo (free public weather API).</p>
    </div>
  );
}
