import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth/roles";
import { getMetaRedirectUri } from "@/lib/meta/config";
import {
  exchangeCodeForToken,
  exchangeForLongLivedUserToken,
  fetchInstagramProfile,
  fetchUserPages,
} from "@/lib/meta/graph";
import { saveMetaIntegration } from "@/lib/meta/store";

const STATE_COOKIE = "cv_meta_oauth_state";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?next=/admin/meta-publishing", req.url)
    );
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error_description") || searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/meta-publishing?error=${encodeURIComponent(error)}`, req.url)
    );
  }

  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);

  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(
      new URL("/admin/meta-publishing?error=invalid_oauth_state", req.url)
    );
  }

  try {
    const redirectUri = getMetaRedirectUri();
    const shortToken = await exchangeCodeForToken(code, redirectUri);
    const userToken = await exchangeForLongLivedUserToken(shortToken);
    const pages = await fetchUserPages(userToken);

    if (!pages.length) {
      return NextResponse.redirect(
        new URL(
          "/admin/meta-publishing?error=no_facebook_pages_found",
          req.url
        )
      );
    }

    const page =
      pages.find((p) => p.instagram_business_account?.id) ?? pages[0];
    const igUserId = page.instagram_business_account?.id ?? null;
    let igUsername: string | null = null;

    if (igUserId) {
      try {
        const ig = await fetchInstagramProfile(igUserId, page.access_token);
        igUsername = ig.username ?? ig.name ?? null;
      } catch {
        igUsername = null;
      }
    }

    await saveMetaIntegration({
      pageId: page.id,
      pageName: page.name,
      pageAccessToken: page.access_token,
      igUserId,
      igUsername,
      connectedAt: new Date().toISOString(),
      source: "oauth",
    });

    return NextResponse.redirect(
      new URL("/admin/meta-publishing?connected=1", req.url)
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "meta_connect_failed";
    return NextResponse.redirect(
      new URL(`/admin/meta-publishing?error=${encodeURIComponent(message)}`, req.url)
    );
  }
}
