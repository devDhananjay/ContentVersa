/** Canonical site URL (no trailing slash). Used for OAuth redirects and post-login redirects. */
function isLocalhostUrl(url: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url);
}

export function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "");

  // On Vercel: ignore localhost in NEXT_PUBLIC_APP_URL (common deploy mistake)
  if (process.env.VERCEL) {
    if (fromEnv && !isLocalhostUrl(fromEnv)) return fromEnv;

    const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (prod) return `https://${prod.replace(/\/$/, "")}`;

    const vercel = process.env.VERCEL_URL?.trim();
    if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  }

  if (fromEnv) return fromEnv;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
