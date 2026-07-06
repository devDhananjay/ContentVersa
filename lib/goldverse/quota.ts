import { prisma } from "@/lib/prisma";

export const HUID_FREE_LIMIT = 5;

export class HuidQuotaExceededError extends Error {
  constructor() {
    super("HUID verification quota exceeded");
    this.name = "HuidQuotaExceededError";
  }
}

export async function getHuidQuotaStatus(userId: string): Promise<{
  used: number;
  limit: number;
  bonusCredits: number;
  remaining: number;
  canVerify: boolean;
}> {
  const row = await prisma.huidVerificationQuota.findUnique({
    where: { userId },
  });
  const used = row?.usedCount ?? 0;
  const bonusCredits = row?.bonusCredits ?? 0;
  const limit = HUID_FREE_LIMIT + bonusCredits;
  const remaining = Math.max(0, limit - used);

  return {
    used,
    limit,
    bonusCredits,
    remaining,
    canVerify: remaining > 0,
  };
}

/**
 * Atomically reserve one verification slot before calling BIS.
 * Prevents race conditions from double-clicks or parallel requests.
 */
export async function reserveHuidVerificationSlot(userId: string): Promise<{
  used: number;
  limit: number;
  remaining: number;
}> {
  return prisma.$transaction(async (tx) => {
    const row = await tx.huidVerificationQuota.upsert({
      where: { userId },
      create: { userId, usedCount: 0, bonusCredits: 0 },
      update: {},
    });

    const limit = HUID_FREE_LIMIT + row.bonusCredits;
    if (row.usedCount >= limit) {
      throw new HuidQuotaExceededError();
    }

    const updated = await tx.huidVerificationQuota.update({
      where: { userId },
      data: { usedCount: { increment: 1 } },
    });

    return {
      used: updated.usedCount,
      limit,
      remaining: Math.max(0, limit - updated.usedCount),
    };
  });
}

export async function logHuidVerification(
  userId: string,
  huid: string,
  success: boolean
) {
  await prisma.huidVerificationLog.create({
    data: { userId, huid, success },
  });
}
