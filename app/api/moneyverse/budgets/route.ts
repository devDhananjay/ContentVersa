import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { monthKey } from "@/lib/moneyverse/dates";
import { moneyversePrismaReady, MONEYVERSE_SETUP_MESSAGE } from "@/lib/moneyverse/prisma-ready";
import { BudgetSchema } from "@/lib/moneyverse/schemas";
import { getMoneyMonthSummary } from "@/lib/moneyverse/summary";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ budgets: [] }, { status: 503 });
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
    const rows = await prisma.moneyBudget.findMany({
      where: { userId },
      orderBy: { category: "asc" },
    });
    return NextResponse.json({ budgets: rows });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    const status = msg.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function PUT(req: Request) {
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
    const body = BudgetSchema.parse(await req.json());

    await prisma.moneyBudget.upsert({
      where: { userId_category: { userId, category: body.category } },
      create: {
        userId,
        category: body.category,
        limitAmount: body.limitAmount,
      },
      update: { limitAmount: body.limitAmount },
    });

    const summary = await getMoneyMonthSummary(userId, monthKey());
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid budget" }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "Error";
    const status = msg.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
