// Minimal Google OAuth2 helpers using `fetch`. No third-party OAuth lib needed.
// We deliberately avoid NextAuth/Auth.js to keep ContentVerse's existing
// JWT-cookie session model (see `lib/auth.ts`).

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v2/userinfo";

export interface GoogleProfile {
  id: string;
  email: string;
  verified_email?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export function isGoogleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function googleRedirectUri() {
  return `${appUrl()}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(state: string, next?: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    access_type: "offline",
    prompt: "select_account",
    scope: ["openid", "email", "profile"].join(" "),
    state: next ? `${state}|${encodeURIComponent(next)}` : state,
  });
  return `${GOOGLE_AUTH}?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string) {
  const res = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }).toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google token exchange failed: ${res.status} ${text}`);
  }

  return (await res.json()) as {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    id_token?: string;
    refresh_token?: string;
  };
}

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const res = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Google profile fetch failed: ${res.status}`);
  }
  return (await res.json()) as GoogleProfile;
}

/** Derive a unique-ish username from email/name when creating a fresh account. */
export function deriveUsername(profile: GoogleProfile) {
  const fromEmail = profile.email?.split("@")[0] || "";
  const fromName = (profile.name || profile.given_name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  const base = (fromEmail || fromName || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "")
    .slice(0, 24) || "user";
  // Add a short suffix to reduce collision risk before the DB unique check.
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
