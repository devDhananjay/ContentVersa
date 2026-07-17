export type NearbyPlace = {
  name: string;
  address?: string;
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  mapsUrl?: string;
  placeId?: string;
};

export async function geocodeAddress(address: string, apiKey: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("region", "in");
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  const data = (await res.json()) as {
    status: string;
    error_message?: string;
    results?: Array<{
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
    }>;
  };
  if (data.status !== "OK" || !data.results?.[0]) {
    throw new Error(data.error_message || `Geocode failed: ${data.status}`);
  }
  const r = data.results[0];
  return {
    address: r.formatted_address,
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
  };
}

export async function nearbySearch(opts: {
  lat: number;
  lng: number;
  type: string;
  apiKey: string;
  radiusMeters?: number;
  keyword?: string;
}): Promise<NearbyPlace[]> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${opts.lat},${opts.lng}`);
  url.searchParams.set("radius", String(opts.radiusMeters ?? 3000));
  url.searchParams.set("type", opts.type);
  if (opts.keyword) url.searchParams.set("keyword", opts.keyword);
  url.searchParams.set("key", opts.apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 600 } });
  const data = (await res.json()) as {
    status: string;
    error_message?: string;
    results?: Array<{
      name: string;
      vicinity?: string;
      formatted_address?: string;
      rating?: number;
      user_ratings_total?: number;
      opening_hours?: { open_now?: boolean };
      geometry?: { location?: { lat: number; lng: number } };
      place_id?: string;
    }>;
  };

  if (data.status === "ZERO_RESULTS") return [];
  if (data.status !== "OK") {
    throw new Error(data.error_message || `Places failed: ${data.status}`);
  }

  return (data.results ?? [])
    .slice(0, 20)
    .map((p) => {
      const lat = p.geometry?.location?.lat;
      const lng = p.geometry?.location?.lng;
      const distanceKm =
        typeof lat === "number" && typeof lng === "number"
          ? roundDistance(haversineKm(opts.lat, opts.lng, lat, lng))
          : undefined;

      return {
        name: p.name,
        address: p.vicinity || p.formatted_address,
        rating: p.rating,
        userRatingsTotal: p.user_ratings_total,
        openNow: p.opening_hours?.open_now,
        lat,
        lng,
        distanceKm,
        placeId: p.place_id,
        mapsUrl: p.place_id
          ? `https://www.google.com/maps/place/?q=place_id:${p.place_id}`
          : lat != null && lng != null
            ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
            : undefined,
      };
    })
    .sort((a, b) => (a.distanceKm ?? Number.MAX_VALUE) - (b.distanceKm ?? Number.MAX_VALUE));
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const radiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * radiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function roundDistance(distanceKm: number) {
  return Math.round(distanceKm * 10) / 10;
}
