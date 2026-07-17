import { NextRequest, NextResponse } from "next/server";

/** Reverse geocode via Nominatim (OpenStreetMap) — free, no key. */
export async function GET(req: NextRequest) {
  try {
    const lat = Number(req.nextUrl.searchParams.get("lat"));
    const lng = Number(req.nextUrl.searchParams.get("lng"));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
    }

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "ContentVerse/1.0 (https://contentverse.co.in; tools@contentverse.co.in)",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Reverse geocode failed" }, { status: 502 });
    }
    const data = (await res.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };

    return NextResponse.json({
      lat,
      lng,
      displayName: data.display_name,
      address: data.address,
    });
  } catch (err) {
    console.error("[tools/geocode]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Geocode failed" }, { status: 502 });
  }
}
