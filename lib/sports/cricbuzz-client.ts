const HOST =
  process.env.RAPIDAPI_CRICBUZZ_HOST?.trim() ||
  "cricbuzz-cricket.p.rapidapi.com";

const BASE = `https://${HOST}`;

export class SportsApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "SportsApiError";
  }
}

export function isSportsApiConfigured(): boolean {
  return Boolean(process.env.RAPIDAPI_KEY?.trim());
}

export async function cricbuzzFetch<T>(path: string): Promise<T> {
  const key = process.env.RAPIDAPI_KEY?.trim();
  if (!key) {
    throw new SportsApiError("RapidAPI key is not configured", 503);
  }

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-host": HOST,
      "x-rapidapi-key": key,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new SportsApiError(
      body || `Cricbuzz API error (${res.status})`,
      res.status
    );
  }

  return res.json() as Promise<T>;
}
