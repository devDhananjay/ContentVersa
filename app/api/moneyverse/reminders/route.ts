import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { monthKey } from "@/lib/moneyverse/dates";
import { moneyversePrismaReady, MONEYVERSE_SETUP_MESSAGE } from "@/lib/moneyverse/prisma-ready";
import { ReminderSchema } from "@/lib/moneyverse/schemas";
import { getMoneyMonthSummary } from "@/lib/moneyverse/summary";
import { toReminderDto } from "@/lib/moneyverse/types";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!moneyversePrismaReady()) {
    return NextResponse.json({ error: MONEYVERSE_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const body = ReminderSchema.parse(await req.json());

    const row = await prisma.moneyReminder.create({
      data: {
        userId,
        type: body.type,
        title: body.title,
        amount: body.amount ?? null,
        dueDay: body.dueDay,
      },
    });

    const summary = await getMoneyMonthSummary(userId, monthKey());
    return NextResponse.json({ reminder: toReminderDto(row), summary });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid reminder" }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "Error";
    const status = msg.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
