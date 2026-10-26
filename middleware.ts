import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/auth";
import {
  LOCALE_COOKIE,
  LOCALE_HEADER,
  localeFromPathname,
  stripLocalePrefix,
  type AppLocale,
} from "@/lib/i18n/config";

const PROTECTED = ["/dashboard", "/admin"];

// Set DEMO_MODE=0 in your env to enforce authentication on protected routes.
const DEMO_MODE = process.env.DEMO_MODE !== "0";

function setLocaleHeaders(res: NextResponse, locale: AppLocale) {
  res.headers.set(LOCALE_HEADER, locale);
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const locale = localeFromPathname(pathname);
  const stripped = stripLocalePrefix(pathname);

  // Rewrite /hi/... → internal path without prefix; keep URL as /hi/...
  let res: NextResponse;
  if (locale === "hi") {
    const url = req.nextUrl.clone();
    url.pathname = stripped;
    res = NextResponse.rewrite(url);
  } else {
    res = NextResponse.next();
  }
  setLocaleHeaders(res, locale);

  if (DEMO_MODE) return res;

  const needsAuth = PROTECTED.some((p) => stripped.startsWith(p));
  if (!needsAuth) return res;

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await verifySession(token) : null;

  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = locale === "hi" ? "/hi/auth/sign-in" : "/auth/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (stripped.startsWith("/admin")) {
    const adminRoles = ["MODERATOR", "ADMIN", "SUPER_ADMIN"];
    if (!adminRoles.includes(user.role)) {
      return NextResponse.redirect(
        new URL(locale === "hi" ? "/hi/dashboard" : "/dashboard", req.url)
      );
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and Next internals.
     * Locale rewrite + auth both run here.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
