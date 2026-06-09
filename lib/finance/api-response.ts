import { NextResponse } from "next/server";
import { FINANCE_CACHE_TTL } from "./constants";

/** JSON response with CDN/browser cache aligned to server TTL. */
export function financeJsonResponse<T>(data: T, status = 200) {
  const maxAge = Math.max(30, Math.floor(FINANCE_CACHE_TTL / 2));
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${FINANCE_CACHE_TTL}`,
    },
  });
}
