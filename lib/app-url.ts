import { PRODUCTION_SITE_URL } from "@/lib/site-config";

/** Canonical site URL (no trailing slash). Used for OAuth redirects and post-login redirects. */
function isLocalhostUrl(url: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url);
}

export function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "");

  if (fromEnv && !isLocalhostUrl(fromEnv)) return fromEnv;

  // Vercel preview/production fallback (ignore localhost in env)
  if (process.env.VERCEL) {
    const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (prod) return `https://${prod.replace(/\/$/, "")}`;

    const vercel = process.env.VERCEL_URL?.trim();
    if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  }

  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "production") return PRODUCTION_SITE_URL;

  return "http://localhost:3000";
}
