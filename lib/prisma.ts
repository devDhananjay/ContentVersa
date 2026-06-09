import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// If DATABASE_URL is missing we still construct a client (lazy validation), but
// we silence Prisma's per-query validation log so the terminal isn't spammed.
// Routes that call into Prisma already guard with try/catch and fall back to
// demo mode. Once DATABASE_URL is set, normal logging resumes.
const hasDb = !!process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: hasDb
      ? process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"]
      : [],
  });

// One client per Node process — avoids pool exhaustion in dev / long-running servers.
globalForPrisma.prisma = prisma;

/** True when a database URL is configured. Use this to short-circuit DB code. */
export const isDatabaseConfigured = () => hasDb;

/** Connection down, pool saturated, or schema missing. */
export function isDbUnavailable(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P1001", "P1002", "P1008", "P1017", "P2021", "P2022", "P2024"].includes(err.code);
  }
  const msg = err instanceof Error ? err.message : String(err);
  return /can't reach database|connection pool|ECONNREFUSED|ETIMEDOUT/i.test(msg);
}

/** Run a Prisma query; return fallback when the database is temporarily unreachable. */
export async function safeDbQuery<T>(
  fallback: T,
  fn: () => Promise<T>,
  label = "db"
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (!isDbUnavailable(err)) throw err;
    if (process.env.NODE_ENV === "development") {
      console.warn(`[${label}] database unavailable — using fallback`);
    }
    return fallback;
  }
}
