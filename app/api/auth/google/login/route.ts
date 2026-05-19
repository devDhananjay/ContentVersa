import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildGoogleAuthUrl, isGoogleConfigured } from "@/lib/auth/google";

export const runtime = "nodejs";

const OAUTH_STATE_COOKIE = "cv_oauth_state";

export async function GET(req: Request) {
  if (!isGoogleConfigured()) {
    return NextResponse.json(
      {
        error:
          "Google sign-in not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env and restart.",
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const next = searchParams.get("next") || "/dashboard";

  const state = crypto.randomUUID().replace(/-/g, "");
  const jar = await cookies();
  jar.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
  });

  return NextResponse.redirect(buildGoogleAuthUrl(state, next));
}
