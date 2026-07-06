export const BIS_ENDPOINTS = {
  getHuid: "https://apis.bis.gov.in/apipool/ecomm/HUID/getHUID",
  ecommLogin: "https://apis.bis.gov.in/apipool/ecomm/api/login",
} as const;

const SERVICE_EMAIL = process.env.BIS_SERVICE_EMAIL ?? "its@bis.gov.in";
const SERVICE_PASSWORD = process.env.BIS_SERVICE_PASSWORD ?? "Bis@123#$";

let cachedToken: { value: string; expiresAt: number } | null = null;

function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
    ) as { exp?: number };
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** BIS Care service login — server-side only, never exposed to clients. */
export async function getHuidServiceToken(): Promise<string> {
  const envToken = process.env.BIS_API_TOKEN?.trim();
  if (envToken) return envToken;

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.value;
  }

  const res = await fetch(BIS_ENDPOINTS.ecommLogin, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: SERVICE_EMAIL,
      password: SERVICE_PASSWORD,
    }),
    cache: "no-store",
  });

  const raw = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  const token = typeof raw?.token === "string" ? raw.token : null;

  if (!res.ok || !token) {
    const message =
      (typeof raw?.message === "string" && raw.message) ||
      (typeof raw?.error === "string" && raw.error) ||
      `Service login failed (HTTP ${res.status})`;
    throw new Error(message);
  }

  const expiresAt = decodeJwtExpiry(token) ?? now + 55 * 60 * 1000;
  cachedToken = { value: token, expiresAt };
  return token;
}
