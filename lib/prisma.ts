import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// If DATABASE_URL is missing we still construct a client (lazy validation), but
// we silence Prisma's per-query validation log so the terminal isn't spammed.
// Routes that call into Prisma already guard with try/catch and fall back to
// demo mode. Once DATABASE_URL is set, normal logging resumes.
const hasDb = !!process.env.DATABASE_URL;

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: hasDb
      ? process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"]
      : [],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

/** True when a database URL is configured. Use this to short-circuit DB code. */
export const isDatabaseConfigured = () => hasDb;
