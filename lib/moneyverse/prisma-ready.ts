import { prisma } from "@/lib/prisma";

export function moneyversePrismaReady(): boolean {
  return typeof (prisma as { moneyExpense?: { create: unknown } }).moneyExpense?.create === "function";
}

export const MONEYVERSE_SETUP_MESSAGE =
  "MoneyVerse tables missing — run: npm run db:push:local (with db:tunnel running)";
