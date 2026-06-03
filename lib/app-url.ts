import { PRODUCTION_SITE_URL } from "@/lib/site-config";

/** Canonical site URL (no trailing slash). Used for OAuth redirects and post-login redirects. */
function isLocalhostUrl(url: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url);
}

/**
 * Server/runtime URL — NOT inlined at build (unlike NEXT_PUBLIC_APP_URL).
 * Set APP_URL=https://contentverse.co.in on production.
 */
function getRuntimeAppUrl(): string | undefined {
  const raw =
    process.env.APP_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim();
  return raw?.replace(/\/$/, "") || undefined;
}

export function getAppUrl(): string {
  const runtime = getRuntimeAppUrl();
  if (runtime && !isLocalhostUrl(runtime)) return runtime;

  const fromPublic = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "");
  if (fromPublic && !isLocalhostUrl(fromPublic)) return fromPublic;

  if (process.env.VERCEL) {
    const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (prod) return `https://${prod.replace(/\/$/, "")}`;

    const vercel = process.env.VERCEL_URL?.trim();
    if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  }

  if (process.env.NODE_ENV === "production") return PRODUCTION_SITE_URL;

  if (fromPublic) return fromPublic;

  return "http://localhost:3001";
}
