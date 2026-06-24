import { NextResponse } from "next/server";
import { GOVT_CATEGORIES } from "@/lib/jobs/constants";
import { fetchSarkariListings, isSarkariApiConfigured } from "@/lib/jobs/sarkari-client";
import type { SarkariCategory } from "@/lib/jobs/types";

const VALID = new Set(GOVT_CATEGORIES.map((item) => item.id));

export async function GET(req: Request) {
  const category = new URL(req.url).searchParams.get("cat") as SarkariCategory | null;

  if (!category || !VALID.has(category)) {
    return NextResponse.json(
      { error: "Invalid category. Use jobs, results, admissions, answer-keys, admit-cards, or syllabus." },
      { status: 400 }
    );
  }

  if (!isSarkariApiConfigured()) {
    return NextResponse.json({ error: "RAPIDAPI_KEY is not configured" }, { status: 503 });
  }

  try {
    const data = await fetchSarkariListings(category);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sarkari API request failed";
    const status = error instanceof Error && "status" in error ? (error.status as number) : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
