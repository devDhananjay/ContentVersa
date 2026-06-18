import { NextResponse } from "next/server";
import { z } from "zod";
import { NotificationType } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { createUserNotification } from "@/lib/notifications/create";

const MIN_WITHDRAW_INR = 100;

const BodySchema = z.object({
  amount: z.number().min(MIN_WITHDRAW_INR),
});

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await req.json();
    const { amount } = BodySchema.parse(body);
    const rounded = Math.floor(amount);

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    const balance = wallet ? Number(wallet.balance) : 0;

    if (rounded > balance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    if (rounded < MIN_WITHDRAW_INR) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ₹${MIN_WITHDRAW_INR}` },
        { status: 400 }
      );
    }

    const pending = await prisma.payoutRequest.count({
      where: { userId, status: { in: ["PENDING", "PROCESSING"] } },
    });
    if (pending > 0) {
      return NextResponse.json(
        { error: "You already have a pending withdrawal" },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.payoutRequest.create({
        data: {
          userId,
          amount: rounded,
          currency: "INR",
          status: "PENDING",
          method: "bank",
        },
      }),
      prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: rounded } },
      }),
    ]);

    await createUserNotification({
      userId,
      type: NotificationType.PAYOUT,
      title: "Withdrawal requested",
      message: `₹${rounded.toLocaleString("en-IN")} payout is being processed.`,
      link: "/dashboard/earnings",
    });

    return NextResponse.json({ ok: true, amount: rounded });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[withdraw]", err);
    return NextResponse.json({ error: "Withdrawal failed" }, { status: 500 });
  }
}
