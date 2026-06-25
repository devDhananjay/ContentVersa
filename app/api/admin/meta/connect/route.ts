import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import {
  getMetaAppId,
  getMetaRedirectUri,
  isMetaAppConfigured,
  META_OAUTH_SCOPES,
} from "@/lib/meta/config";

const STATE_COOKIE = "cv_meta_oauth_state";

export async function GET() {
  try {
    await requireAdminApi();
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!isMetaAppConfigured()) {
    return NextResponse.json(
      {
        error:
          "Meta app not configured. Set META_APP_ID and META_APP_SECRET in .env, or use manual Page token setup.",
      },
      { status: 503 }
    );
  }

  const state = crypto.randomUUID().replace(/-/g, "");
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 15,
  });

  const url = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  url.searchParams.set("client_id", getMetaAppId());
  url.searchParams.set("redirect_uri", getMetaRedirectUri());
  url.searchParams.set("state", state);
  url.searchParams.set("scope", META_OAUTH_SCOPES);
  url.searchParams.set("response_type", "code");

  return NextResponse.redirect(url.toString());
}
