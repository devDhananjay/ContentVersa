import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import {
  COOKIE_MAX_AGE,
  SITE_VISITOR_COOKIE,
  newSiteVisitorKey,
  recordSiteVisit,
} from "@/lib/site-visitors";

export async function POST() {
  try {
    const jar = await cookies();
    let visitorKey = jar.get(SITE_VISITOR_COOKIE)?.value;
    const isNewCookie = !visitorKey;
    if (!visitorKey) visitorKey = newSiteVisitorKey();

    const session = await getCurrentUser();
    const userId = session ? await resolveUserId(session) : null;

    const result = await recordSiteVisit({ visitorKey, userId });

    const res = NextResponse.json({
      ok: true,
      uniqueVisitors: result.uniqueVisitors,
      isNew: result.isNew,
    });

    if (isNewCookie) {
      res.cookies.set(SITE_VISITOR_COOKIE, visitorKey, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    }

    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
