import { cache } from "@/lib/redis";

const TOKEN_CACHE_KEY = "feeds:producthunt:token";

export async function getProductHuntToken(): Promise<string | null> {
  const cached = await cache.get<string>(TOKEN_CACHE_KEY);
  if (cached) return cached;

  const clientId = process.env.PRODUCT_HUNT_API_KEY;
  const clientSecret = process.env.PRODUCT_HUNT_API_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch("https://api.producthunt.com/v2/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!data.access_token) return null;

  const ttl = Math.max(3600, (data.expires_in ?? 86_400) - 300);
  await cache.set(TOKEN_CACHE_KEY, data.access_token, ttl);
  return data.access_token;
}
