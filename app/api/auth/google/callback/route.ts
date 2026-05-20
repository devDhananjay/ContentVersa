import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeGoogleCode,
  fetchGoogleProfile,
  deriveUsername,
  type GoogleProfile,
} from "@/lib/auth/google";
import { persistGoogleUser } from "@/lib/auth/google-user";
import { isDatabaseConfigured } from "@/lib/prisma";
import { signSession, setSessionCookie, type SessionUser } from "@/lib/auth";

export const runtime = "nodejs";

const OAUTH_STATE_COOKIE = "cv_oauth_state";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function fail(reason: string) {
  const url = new URL("/auth/sign-in", appUrl());
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

type DbRole = SessionUser["role"];

function sessionFromGoogleProfile(
  sub: string,
  role: DbRole,
  profile: GoogleProfile,
  username?: string
): Omit<SessionUser, "iat" | "exp"> {
  return {
    sub,
    role,
    email: profile.email,
    username: username || deriveUsername(profile),
    name: profile.name || profile.given_name || undefined,
    image: profile.picture || undefined,
  };
}

function sessionFromDbUser(
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    name: string | null;
    image: string | null;
  },
  profile: GoogleProfile
): Omit<SessionUser, "iat" | "exp"> {
  return {
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role as DbRole,
    name: user.name || profile.name || profile.given_name || undefined,
    image: user.image || profile.picture || undefined,
  };
}

async function signInAndRedirect(
  session: Omit<SessionUser, "iat" | "exp">,
  next: string
) {
  const token = await signSession(session);
  await setSessionCookie(token);
  return NextResponse.redirect(new URL(next, appUrl()));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");

  if (!code || !stateParam) return fail("missing_code");

  const jar = await cookies();
  const expected = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.delete(OAUTH_STATE_COOKIE);

  const [csrf, encodedNext] = stateParam.split("|");
  if (!expected || expected !== csrf) return fail("state_mismatch");
  const next = encodedNext ? decodeURIComponent(encodedNext) : "/dashboard";

  let profile: GoogleProfile;
  try {
    const tokens = await exchangeGoogleCode(code);
    profile = await fetchGoogleProfile(tokens.access_token);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[google-oauth] exchange failed:", msg);
    return fail("google_exchange_failed");
  }

  if (!profile.email) return fail("no_email");

  if (isDatabaseConfigured()) {
    try {
      const user = await persistGoogleUser(profile);
      return signInAndRedirect(sessionFromDbUser(user, profile), next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[google-oauth] DB persist failed, JWT fallback:", msg);
    }
  }

  return signInAndRedirect(
    sessionFromGoogleProfile(`google:${profile.id}`, "USER", profile),
    next
  );
}
