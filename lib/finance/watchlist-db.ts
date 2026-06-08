import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { normalizeSymbol } from "./transformers";

export async function getUserWatchlistSymbols(userId: string): Promise<string[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await prisma.financeWatchlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { symbol: true },
  });
  return rows.map((r) => r.symbol);
}

export async function addToWatchlist(
  userId: string,
  symbolInput: string
): Promise<string[]> {
  const symbol = normalizeSymbol(symbolInput);
  await prisma.financeWatchlistItem.upsert({
    where: { userId_symbol: { userId, symbol } },
    create: { userId, symbol },
    update: {},
  });
  return getUserWatchlistSymbols(userId);
}

export async function removeFromWatchlist(
  userId: string,
  symbolInput: string
): Promise<string[]> {
  const symbol = normalizeSymbol(symbolInput);
  await prisma.financeWatchlistItem.deleteMany({
    where: { userId, symbol },
  });
  return getUserWatchlistSymbols(userId);
}

export async function isInWatchlist(
  userId: string,
  symbolInput: string
): Promise<boolean> {
  const symbol = normalizeSymbol(symbolInput);
  const row = await prisma.financeWatchlistItem.findUnique({
    where: { userId_symbol: { userId, symbol } },
    select: { id: true },
  });
  return !!row;
}
