import { NextResponse } from "next/server";
import { z } from "zod";
import { recommendMovies } from "@/lib/cineverse/recommend";

const Schema = z.object({
  mood: z.string().min(2).max(120),
  language: z.string().max(40).optional(),
  ott: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  try {
    const body = Schema.parse(await req.json());
    const result = await recommendMovies(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
