import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { requireUserId, resolveUserId } from "@/lib/auth/resolve-user-id";
import { monthKey } from "@/lib/moneyverse/dates";
import { ExpenseSchema } from "@/lib/moneyverse/schemas";
import {
  emptyMonthSummary,
  getMoneyMonthSummary,
} from "@/lib/moneyverse/summary";
import { moneyversePrismaReady, MONEYVERSE_SETUP_MESSAGE } from "@/lib/moneyverse/prisma-ready";
import { isDatabaseConfigured, isDbUnavailable, prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const month = url.searchParams.get("month")?.trim() || monthKey();

  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ ...emptyMonthSummary(month), loggedIn: false });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ...emptyMonthSummary(month), loggedIn: true });
  }

  const userId = await resolveUserId(session);
  if (!userId) {
    return NextResponse.json({ ...emptyMonthSummary(month), loggedIn: false });
  }

  if (!moneyversePrismaReady()) {
    return NextResponse.json({ ...emptyMonthSummary(month), loggedIn: true, error: "schema_stale" });
  }

  try {
    const summary = await getMoneyMonthSummary(userId, month);
    return NextResponse.json(summary);
  } catch (err) {
    if (isDbUnavailable(err)) {
      return NextResponse.json({ ...emptyMonthSummary(month), loggedIn: true });
    }
    console.error("[api/moneyverse/summary]", err);
    return NextResponse.json({ ...emptyMonthSummary(month), loggedIn: true });
  }
}

export async function POST(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!moneyversePrismaReady()) {
    return NextResponse.json({ error: MONEYVERSE_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = await requireUserId(session);
    const body = ExpenseSchema.parse(await req.json());

    const row = await prisma.moneyExpense.create({
      data: {
        userId,
        amount: body.amount,
        category: body.category,
        note: body.note || null,
        method: body.method,
        spentAt: body.spentAt ? new Date(body.spentAt) : new Date(),
      },
    });

    const month = monthKey(row.spentAt);
    const summary = await getMoneyMonthSummary(userId, month);
    return NextResponse.json({ expense: row, summary });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid expense" }, { status: 400 });
    }
    if (isDbUnavailable(err)) {
      return NextResponse.json(
        { error: "MoneyVerse tables missing — run: npm run db:push:local" },
        { status: 503 }
      );
    }
    const msg = err instanceof Error ? err.message : "Error";
    const status =
      msg.includes("Unauthorized") || msg.includes("UNAUTHENTICATED") || msg === "USER_NOT_FOUND"
        ? 401
        : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
