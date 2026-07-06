import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { monthKey } from "@/lib/moneyverse/dates";
import { getMoneyMonthSummary } from "@/lib/moneyverse/summary";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const { id } = await params;

    const expense = await prisma.moneyExpense.findFirst({
      where: { id, userId },
    });
    if (!expense) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.moneyExpense.delete({ where: { id } });
    const summary = await getMoneyMonthSummary(userId, monthKey(expense.spentAt));
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    const status = msg.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
