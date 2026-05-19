import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeGoogleCode,
  fetchGoogleProfile,
  deriveUsername,
  type GoogleProfile,
} from "@/lib/auth/google";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { signSession, setSessionCookie } from "@/lib/auth";

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");

  if (!code || !stateParam) return fail("missing_code");

  const jar = await cookies();
  const expected = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.delete(OAUTH_STATE_COOKIE);

  // state may be "<csrf>|<encodedNext>" — verify the CSRF half.
  const [csrf, encodedNext] = stateParam.split("|");
  if (!expected || expected !== csrf) return fail("state_mismatch");
  const next = encodedNext ? decodeURIComponent(encodedNext) : "/dashboard";

  let profile: GoogleProfile;
  try {
    const tokens = await exchangeGoogleCode(code);
    profile = await fetchGoogleProfile(tokens.access_token);
  } catch (err) {
    console.error("[google-oauth] exchange failed", err);
    return fail("google_exchange_failed");
  }

  if (!profile.email) return fail("no_email");

  // Persist user (+ profile + wallet + Google Account row) when the DB is up.
  // If the DB is unreachable, we still sign the user in via a stateless JWT
  // session so the demo experience keeps working.
  if (isDatabaseConfigured()) {
    try {
      const upserted = await prisma.$transaction(async (tx) => {
        // 1. Find user by email (Google verified) — link the Google account if missing.
        let user = await tx.user.findUnique({ where: { email: profile.email } });

        if (!user) {
          // Generate a unique username with retry on conflict.
          let username = deriveUsername(profile);
          for (let i = 0; i < 5; i++) {
            const taken = await tx.user.findUnique({ where: { username } });
            if (!taken) break;
            username = deriveUsername(profile);
          }

          user = await tx.user.create({
            data: {
              email: profile.email,
              username,
              name: profile.name || profile.given_name || null,
              image: profile.picture || null,
              emailVerified: profile.verified_email ? new Date() : null,
              profile: {
                create: {
                  bio: null,
                  headline: null,
                },
              },
              wallet: { create: {} },
              accounts: {
                create: {
                  provider: "GOOGLE",
                  providerAccountId: profile.id,
                },
              },
            },
          });
        } else {
          // Existing user → ensure Google account is linked and Profile/Wallet exist.
          await tx.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: "GOOGLE",
                providerAccountId: profile.id,
              },
            },
            create: {
              userId: user.id,
              provider: "GOOGLE",
              providerAccountId: profile.id,
            },
            update: {},
          });
          await tx.profile.upsert({
            where: { userId: user.id },
            create: { userId: user.id },
            update: {},
          });
          await tx.wallet.upsert({
            where: { userId: user.id },
            create: { userId: user.id },
            update: {},
          });
          // Refresh display fields from Google in case the user updated them.
          if ((!user.name && profile.name) || (!user.image && profile.picture)) {
            user = await tx.user.update({
              where: { id: user.id },
              data: {
                name: user.name ?? profile.name ?? null,
                image: user.image ?? profile.picture ?? null,
                emailVerified:
                  user.emailVerified ??
                  (profile.verified_email ? new Date() : null),
              },
            });
          }
        }
        return user;
      });

      const token = await signSession({
        sub: upserted.id,
        email: upserted.email,
        username: upserted.username,
        role: upserted.role as
          | "USER"
          | "ADMIN"
          | "MODERATOR"
          | "VERIFIED_CREATOR"
          | "SUPER_ADMIN"
          | "GUEST",
        name: upserted.name || undefined,
        image: upserted.image || undefined,
      });
      await setSessionCookie(token);
      return NextResponse.redirect(new URL(next, appUrl()));
    } catch (err) {
      console.error("[google-oauth] DB upsert failed, falling back to JWT-only", err);
      // fall through to demo session below
    }
  }

  // Demo / no-DB fallback — still sign the user in.
  const token = await signSession({
    sub: `google:${profile.id}`,
    email: profile.email,
    username: (profile.email.split("@")[0] || "user").toLowerCase(),
    role: "USER",
    name: profile.name || undefined,
    image: profile.picture || undefined,
  });
  await setSessionCookie(token);
  return NextResponse.redirect(new URL(next, appUrl()));
}
