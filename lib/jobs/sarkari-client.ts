import { SARKARI_CACHE_SECONDS, SARKARI_HOST } from "@/lib/jobs/constants";
import type { SarkariCategory, SarkariResponse } from "@/lib/jobs/types";

const BASE = `https://${SARKARI_HOST}`;

export class SarkariApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "SarkariApiError";
  }
}

export function isSarkariApiConfigured(): boolean {
  return Boolean(process.env.RAPIDAPI_KEY?.trim());
}

export async function fetchSarkariListings(
  category: SarkariCategory
): Promise<SarkariResponse> {
  const key = process.env.RAPIDAPI_KEY?.trim();
  if (!key) {
    throw new SarkariApiError("RapidAPI key is not configured", 503);
  }

  const res = await fetch(`${BASE}/${category}/`, {
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-host": SARKARI_HOST,
      "x-rapidapi-key": key,
    },
    next: { revalidate: SARKARI_CACHE_SECONDS },
  });

  const body = (await res.json().catch(() => ({}))) as SarkariResponse & {
    message?: string;
  };

  if (!res.ok) {
    throw new SarkariApiError(body.message || `Sarkari API error (${res.status})`, res.status);
  }

  if (!body.success || !Array.isArray(body.data)) {
    throw new SarkariApiError(body.message || "Invalid Sarkari API response", 502);
  }

  return body;
}
