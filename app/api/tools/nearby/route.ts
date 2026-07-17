import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress, nearbySearch } from "@/lib/tools/google-places";
import { PLACE_CATEGORY_META, type PlaceCategory } from "@/lib/tools/places";

function getMapsKey() {
  return process.env.GOOGLE_MAPS_API_KEY?.trim() || "";
}

export async function GET(req: NextRequest) {
  try {
    const key = getMapsKey();
    if (!key) {
      return NextResponse.json(
        { error: "Google Maps API key is not configured on this server" },
        { status: 503 }
      );
    }

    const category = (req.nextUrl.searchParams.get("category") || "places") as PlaceCategory;
    const meta = PLACE_CATEGORY_META[category] || PLACE_CATEGORY_META.places;
    const location =
      req.nextUrl.searchParams.get("location")?.trim() ||
      req.nextUrl.searchParams.get("city")?.trim();
    const latParam = req.nextUrl.searchParams.get("lat");
    const lngParam = req.nextUrl.searchParams.get("lng");
    const radius = Number(req.nextUrl.searchParams.get("radius") || "3000");

    let lat = latParam ? Number(latParam) : NaN;
    let lng = lngParam ? Number(lngParam) : NaN;
    let resolvedAddress: string | undefined;

    if ((!Number.isFinite(lat) || !Number.isFinite(lng)) && location) {
      const geo = await geocodeAddress(
        location.toLowerCase().includes("india") ? location : `${location}, India`,
        key
      );
      lat = geo.lat;
      lng = geo.lng;
      resolvedAddress = geo.address;
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: "Provide a location, area, city, or lat/lng coordinates" },
        { status: 400 }
      );
    }

    const places = await nearbySearch({
      lat,
      lng,
      type: meta.googleType,
      apiKey: key,
      radiusMeters: Number.isFinite(radius) ? Math.min(Math.max(radius, 500), 20000) : 3000,
      keyword: meta.keyword,
    });

    return NextResponse.json({
      category,
      label: meta.label,
      center: { lat, lng, address: resolvedAddress },
      places,
    });
  } catch (err) {
    console.error("[tools/nearby]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Nearby search failed" },
      { status: 502 }
    );
  }
}
