import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { verifyHuid } from "@/lib/jewellers/huid-verify";
import {
  HuidQuotaExceededError,
  logHuidVerification,
  reserveHuidVerificationSlot,
} from "@/lib/jewellers/quota";
import { isDatabaseConfigured } from "@/lib/prisma";

const Schema = z.object({
  huid: z
    .string()
    .trim()
    .min(6)
    .max(6)
    .regex(/^[A-Za-z0-9]{6}$/, "HUID must be 6 alphanumeric characters"),
});

/**
 * Authenticated HUID verify — quota enforced server-side only.
 * Clients cannot bypass the 5-use limit via DevTools.
 */
export async function POST(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const { huid } = Schema.parse(await req.json());
    const normalized = huid.toUpperCase();

    let quotaAfter;
    try {
      quotaAfter = await reserveHuidVerificationSlot(userId);
    } catch (err) {
      if (err instanceof HuidQuotaExceededError) {
        return NextResponse.json(
          {
            ok: false,
            error: "quota_exceeded",
            message:
              "Free HUID checks used up. Contact us to purchase API access for your business.",
            contactPath: "/contact?subject=HUID%20API%20Access",
          },
          { status: 429 }
        );
      }
      throw err;
    }

    const result = await verifyHuid(normalized);
    await logHuidVerification(userId, normalized, result.ok);

    return NextResponse.json({
      ok: result.ok,
      source: result.source,
      message: result.message,
      huid: result.huid,
      data: result.data,
      quota: quotaAfter,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "invalid_huid", message: "Enter a valid 6-character HUID" },
        { status: 400 }
      );
    }
    const msg = err instanceof Error ? err.message : "Unauthorized";
    const status =
      msg.includes("Unauthorized") || msg.includes("UNAUTHENTICATED") ? 401 : 500;
    return NextResponse.json({ ok: false, error: "server_error", message: msg }, { status });
  }
}
