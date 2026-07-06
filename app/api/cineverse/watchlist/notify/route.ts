import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/prisma";

const Schema = z.object({
  tmdbId: z.string().regex(/^\d+$/),
  trailerNotify: z.boolean(),
});

const QuerySchema = z.object({
  tmdbId: z.string().regex(/^\d+$/),
});

/** Read trailer alert preference for a watchlisted movie. */
export async function GET(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const tmdbId = new URL(req.url).searchParams.get("tmdbId")?.trim();
    const parsed = QuerySchema.safeParse({ tmdbId });
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid tmdbId required" }, { status: 400 });
    }

    const row = await prisma.movieWatchlistItem.findUnique({
      where: { userId_tmdbId: { userId, tmdbId: parsed.data.tmdbId } },
      select: { trailerNotify: true },
    });
    if (!row) {
      return NextResponse.json({ onWatchlist: false });
    }

    return NextResponse.json({
      onWatchlist: true,
      trailerNotify: row.trailerNotify,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    const status = msg.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

/** Toggle trailer alerts for a watchlisted movie. */
export async function PATCH(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const { tmdbId, trailerNotify } = Schema.parse(await req.json());

    const row = await prisma.movieWatchlistItem.findUnique({
      where: { userId_tmdbId: { userId, tmdbId } },
    });
    if (!row) {
      return NextResponse.json({ error: "Not on watchlist" }, { status: 404 });
    }

    await prisma.movieWatchlistItem.update({
      where: { id: row.id },
      data: { trailerNotify },
    });

    return NextResponse.json({ ok: true, trailerNotify });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    const status = msg.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
