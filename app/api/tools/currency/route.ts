import { NextRequest, NextResponse } from "next/server";

/** Frankfurter.app — free ECB mid-market rates, no key. */
export async function GET(req: NextRequest) {
  try {
    const amount = Number(req.nextUrl.searchParams.get("amount") || "1");
    const from = (req.nextUrl.searchParams.get("from") || "INR").toUpperCase();
    const to = (req.nextUrl.searchParams.get("to") || "USD").toUpperCase();
    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (from === to) {
      return NextResponse.json({ amount, from, to, rate: 1, result: amount, date: null });
    }

    const url = `https://api.frankfurter.app/latest?amount=${encodeURIComponent(String(amount))}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ error: "Rate lookup failed" }, { status: 502 });
    }
    const data = (await res.json()) as {
      amount: number;
      base: string;
      date: string;
      rates: Record<string, number>;
    };
    const result = data.rates[to];
    if (result == null) {
      return NextResponse.json({ error: `Unsupported currency: ${to}` }, { status: 400 });
    }
    return NextResponse.json({
      amount: data.amount,
      from: data.base,
      to,
      rate: result / (data.amount || 1),
      result,
      date: data.date,
    });
  } catch (err) {
    console.error("[tools/currency]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Currency conversion failed" }, { status: 502 });
  }
}
