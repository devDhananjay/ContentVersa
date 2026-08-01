import { NextRequest, NextResponse } from "next/server";

type GeoPlace = {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
};

async function reversePlace(lat: number, lng: number): Promise<GeoPlace> {
  // BigDataCloud works reliably from servers (no API key for client endpoint).
  try {
    const bdc = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
    bdc.searchParams.set("latitude", String(lat));
    bdc.searchParams.set("longitude", String(lng));
    bdc.searchParams.set("localityLanguage", "en");
    const res = await fetch(bdc.toString(), { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = (await res.json()) as {
        city?: string;
        locality?: string;
        principalSubdivision?: string;
        countryName?: string;
      };
      const name =
        data.city?.trim() ||
        data.locality?.trim() ||
        data.principalSubdivision?.trim();
      if (name) {
        return {
          name,
          latitude: lat,
          longitude: lng,
          admin1: data.principalSubdivision,
          country: data.countryName,
        };
      }
    }
  } catch {
    /* fall through */
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("zoom", "12");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "ContentVerse India/1.0 (https://contentverse.co.in; tools@contentverse.co.in)",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = (await res.json()) as { address?: Record<string, string> };
      const a = data.address ?? {};
      const name =
        a.city ||
        a.town ||
        a.village ||
        a.municipality ||
        a.city_district ||
        a.suburb ||
        a.county ||
        a.state_district ||
        a.state;
      if (name) {
        return {
          name,
          latitude: lat,
          longitude: lng,
          admin1: a.state,
          country: a.country,
        };
      }
    }
  } catch {
    /* fall through */
  }

  return { name: "Near you", latitude: lat, longitude: lng };
}

async function geocodeCity(city: string): Promise<GeoPlace | null> {
  const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geoUrl.searchParams.set("name", city);
  geoUrl.searchParams.set("count", "1");
  geoUrl.searchParams.set("language", "en");
  geoUrl.searchParams.set("format", "json");
  geoUrl.searchParams.set("countryCode", "IN");

  const geoRes = await fetch(geoUrl.toString(), { next: { revalidate: 3600 } });
  const geo = (await geoRes.json()) as { results?: GeoPlace[] };
  return geo.results?.[0] ?? null;
}

async function fetchForecast(lat: number, lng: number) {
  const wUrl = new URL("https://api.open-meteo.com/v1/forecast");
  wUrl.searchParams.set("latitude", String(lat));
  wUrl.searchParams.set("longitude", String(lng));
  wUrl.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
  );
  wUrl.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum"
  );
  wUrl.searchParams.set("timezone", "auto");
  wUrl.searchParams.set("forecast_days", "7");

  const wRes = await fetch(wUrl.toString(), { next: { revalidate: 1800 } });
  if (!wRes.ok) throw new Error("Forecast failed");
  return wRes.json();
}

/** Open-Meteo — free, no API key. Supports ?city= or ?lat=&lng= */
export async function GET(req: NextRequest) {
  try {
    const city = req.nextUrl.searchParams.get("city")?.trim();
    const latParam = req.nextUrl.searchParams.get("lat");
    const lngParam = req.nextUrl.searchParams.get("lng");
    const lat = latParam != null ? Number(latParam) : NaN;
    const lng = lngParam != null ? Number(lngParam) : NaN;

    let place: GeoPlace | null = null;

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
      }
      place = await reversePlace(lat, lng);
    } else if (city && city.length >= 2) {
      place = await geocodeCity(city);
      if (!place) {
        return NextResponse.json({ error: "City not found in India" }, { status: 404 });
      }
    } else {
      return NextResponse.json(
        { error: "Enter a city name or lat/lng" },
        { status: 400 }
      );
    }

    const weather = await fetchForecast(place.latitude, place.longitude);

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
