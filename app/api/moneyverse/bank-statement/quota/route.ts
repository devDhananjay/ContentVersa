import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { refreshSessionIfStale } from "@/lib/auth/refresh-session";
import {
  BANK_STATEMENT_FREE_LIMIT,
  getBankStatementQuotaStatus,
} from "@/lib/moneyverse/bank-statement-quota";
import { isDatabaseConfigured } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
};

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        used: 0,
        limit: BANK_STATEMENT_FREE_LIMIT,
        remaining: 0,
        canAnalyze: false,
        unlimited: false,
        loggedIn: false,
      },
      { headers: NO_STORE }
    );
  }

  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json(
      {
        used: 0,
        limit: BANK_STATEMENT_FREE_LIMIT,
        remaining: 0,
        canAnalyze: false,
        unlimited: false,
        loggedIn: false,
      },
      { headers: NO_STORE }
    );
  }

  const session = await refreshSessionIfStale(current);
  const status = await getBankStatementQuotaStatus(session);
  return NextResponse.json({ ...status, loggedIn: true }, { headers: NO_STORE });
}
