import type { SessionUser } from "@/lib/auth";
import { resolveSessionRole } from "@/lib/auth/resolve-session-role";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { isAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

export const BANK_STATEMENT_FREE_LIMIT = 5;

export class BankStatementQuotaExceededError extends Error {
  constructor() {
    super("Bank statement analysis quota exceeded");
    this.name = "BankStatementQuotaExceededError";
  }
}

export function hasUnlimitedBankStatementAccess(role: SessionUser["role"] | string) {
  // MODERATOR / ADMIN / SUPER_ADMIN — same admin family as rest of the app
  return isAdminRole(role);
}

export async function getBankStatementQuotaStatus(session: SessionUser): Promise<{
  used: number;
  limit: number | null;
  remaining: number | null;
  canAnalyze: boolean;
  unlimited: boolean;
  role: string;
}> {
  const userId = await resolveUserId(session);
  const role = await resolveSessionRole(session);
  const unlimited = hasUnlimitedBankStatementAccess(role);

  if (!userId) {
    return {
      used: 0,
      limit: BANK_STATEMENT_FREE_LIMIT,
      remaining: 0,
      canAnalyze: unlimited,
      unlimited,
      role,
    };
  }

  const row = await prisma.bankStatementAnalysisQuota.findUnique({
    where: { userId },
  });
  const used = row?.usedCount ?? 0;

  if (unlimited) {
    return {
      used,
      limit: null,
      remaining: null,
      canAnalyze: true,
      unlimited: true,
      role,
    };
  }

  const remaining = Math.max(0, BANK_STATEMENT_FREE_LIMIT - used);
  return {
    used,
    limit: BANK_STATEMENT_FREE_LIMIT,
    remaining,
    canAnalyze: remaining > 0,
    unlimited: false,
    role,
  };
}

/**
 * Atomically reserves one analysis before calling Gemini.
 * A valid authenticated API request therefore cannot bypass quota via Postman.
 */
export async function reserveBankStatementAnalysis(session: SessionUser): Promise<{
  used: number;
  limit: number | null;
  remaining: number | null;
  unlimited: boolean;
  role: string;
}> {
  const userId = await resolveUserId(session);
  const role = await resolveSessionRole(session);

  if (!userId) {
    throw new Error("USER_NOT_FOUND");
  }

  if (hasUnlimitedBankStatementAccess(role)) {
    return {
      used: 0,
      limit: null,
      remaining: null,
      unlimited: true,
      role,
    };
  }

  return prisma.$transaction(async (tx) => {
    const row = await tx.bankStatementAnalysisQuota.upsert({
      where: { userId },
      create: { userId, usedCount: 0 },
      update: {},
    });

    if (row.usedCount >= BANK_STATEMENT_FREE_LIMIT) {
      throw new BankStatementQuotaExceededError();
    }

    const updated = await tx.bankStatementAnalysisQuota.update({
      where: { userId },
      data: { usedCount: { increment: 1 } },
    });

    return {
      used: updated.usedCount,
      limit: BANK_STATEMENT_FREE_LIMIT,
      remaining: Math.max(0, BANK_STATEMENT_FREE_LIMIT - updated.usedCount),
      unlimited: false,
      role,
    };
  });
}
