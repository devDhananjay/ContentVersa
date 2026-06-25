import { NextResponse } from "next/server";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { requireUserId, resolveUserId } from "@/lib/auth/resolve-user-id";
import { isDatabaseConfigured } from "@/lib/prisma";
import { addToWatchlist, getUserWatchlistSymbols, removeFromWatchlist } from "@/lib/finance/watchlist-db";
import { fetchQuotesCached } from "@/lib/finance/fetch-quotes";
import { isKnownFinanceSymbol } from "@/lib/finance/stock-search";
import { resolveFinanceSymbol } from "@/lib/finance/transformers";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ symbols: [], quotes: [], loggedIn: false });
  }

  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ symbols: [], quotes: [], loggedIn: false });
  }

  const userId = await resolveUserId(session);
  if (!userId) {
    return NextResponse.json({ symbols: [], quotes: [], loggedIn: false });
  }

  const symbols = await getUserWatchlistSymbols(userId);
  const quotes = symbols.length ? await fetchQuotesCached(symbols) : [];

  return NextResponse.json({ symbols, quotes, loggedIn: true });
}

export async function POST(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const body = (await req.json()) as { symbol?: string };
    if (!body.symbol?.trim()) {
      return NextResponse.json({ error: "symbol required" }, { status: 400 });
    }

    const symbol = resolveFinanceSymbol(body.symbol);
    if (!isKnownFinanceSymbol(symbol)) {
      return NextResponse.json(
        { error: "Stock not found. Try Nifty 50 symbols like RELIANCE, TCS, INFY." },
        { status: 404 }
      );
    }

    const quoteCheck = await fetchQuotesCached([symbol]);
    if (!quoteCheck.length) {
      return NextResponse.json(
        { error: "Could not fetch quote for that symbol. Check the ticker and try again." },
        { status: 404 }
      );
    }

    const symbols = await addToWatchlist(userId, symbol);
    const quotes = await fetchQuotesCached(symbols);

    return NextResponse.json({ ok: true, symbols, quotes });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    const status = msg.includes("Unauthorized") || msg.includes("sign in") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const symbol = new URL(req.url).searchParams.get("symbol");
    if (!symbol) {
      return NextResponse.json({ error: "symbol required" }, { status: 400 });
    }

    const symbols = await removeFromWatchlist(userId, symbol);
    const quotes = symbols.length ? await fetchQuotesCached(symbols) : [];

    return NextResponse.json({ ok: true, symbols, quotes });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    const status = msg.includes("Unauthorized") || msg.includes("sign in") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
