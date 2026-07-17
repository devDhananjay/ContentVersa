import { NextRequest, NextResponse } from "next/server";

/** Open-Meteo — free, no API key. */
export async function GET(req: NextRequest) {
  try {
    const city = req.nextUrl.searchParams.get("city")?.trim();
    if (!city || city.length < 2) {
      return NextResponse.json({ error: "Enter a city name" }, { status: 400 });
    }

    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.searchParams.set("name", city);
    geoUrl.searchParams.set("count", "1");
    geoUrl.searchParams.set("language", "en");
    geoUrl.searchParams.set("format", "json");
    geoUrl.searchParams.set("countryCode", "IN");

    const geoRes = await fetch(geoUrl.toString(), { next: { revalidate: 3600 } });
    const geo = (await geoRes.json()) as {
      results?: Array<{
        name: string;
        latitude: number;
        longitude: number;
        admin1?: string;
        country?: string;
      }>;
    };
    const place = geo.results?.[0];
    if (!place) {
      return NextResponse.json({ error: "City not found in India" }, { status: 404 });
    }

    const wUrl = new URL("https://api.open-meteo.com/v1/forecast");
    wUrl.searchParams.set("latitude", String(place.latitude));
    wUrl.searchParams.set("longitude", String(place.longitude));
    wUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m");
    wUrl.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum");
    wUrl.searchParams.set("timezone", "Asia/Kolkata");
    wUrl.searchParams.set("forecast_days", "7");

    const wRes = await fetch(wUrl.toString(), { next: { revalidate: 1800 } });
    const weather = await wRes.json();

    return NextResponse.json({
      place: {
        name: place.name,
        region: place.admin1,
        country: place.country,
        lat: place.latitude,
        lng: place.longitude,
      },
      current: weather.current,
      daily: weather.daily,
      units: weather.current_units,
    });
  } catch (err) {
    console.error("[tools/weather]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Weather lookup failed" }, { status: 502 });
  }
}
