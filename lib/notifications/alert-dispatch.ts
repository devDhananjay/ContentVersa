import { prisma, isDatabaseConfigured } from "@/lib/prisma";

/** Prevent duplicate cricket/stock alert sends for the same event. */
export async function claimAlertDispatch(alertKey: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return true;

  try {
    await prisma.alertDispatch.create({
      data: { alertKey },
    });
    return true;
  } catch {
    return false;
  }
}

export function istDateKey(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
