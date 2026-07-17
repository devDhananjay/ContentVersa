import { NextRequest, NextResponse } from "next/server";
import { fallbackIndiaHolidays, type IndiaHoliday } from "@/lib/tools/india-holidays";

/** Nager.Date public holidays — free, no key. */
export async function GET(req: NextRequest) {
  try {
    const yearParam = req.nextUrl.searchParams.get("year");
    const year = yearParam ? Number(yearParam) : new Date().getFullYear();
    if (!Number.isFinite(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    const data = await fetchPublicHolidays(year);

    return NextResponse.json({
      year,
      holidays: data,
    });
  } catch (err) {
    console.error("[tools/holidays]", err instanceof Error ? err.message : err);
    const yearParam = req.nextUrl.searchParams.get("year");
    const year = yearParam ? Number(yearParam) : new Date().getFullYear();
    return NextResponse.json({
      year,
      holidays: fallbackIndiaHolidays(year),
      source: "fallback",
    });
  }
}

async function fetchPublicHolidays(year: number): Promise<IndiaHoliday[]> {
  if (year === 2026) {
    return fallbackIndiaHolidays(year);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/IN`;
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 86_400 },
    });
    if (!res.ok) return fallbackIndiaHolidays(year);

    const data = (await res.json()) as Array<{
      date: string;
      localName: string;
      name: string;
      types: string[];
    }>;

    if (!Array.isArray(data) || data.length === 0) return fallbackIndiaHolidays(year);

    return data.map((h) => ({
      date: h.date,
      name: h.localName || h.name,
      englishName: h.name,
      types: h.types,
      source: "Public API",
    }));
  } finally {
    clearTimeout(timeout);
  }
}
