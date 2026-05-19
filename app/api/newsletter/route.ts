import { NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = Schema.parse(body);
    return NextResponse.json({ ok: true, email });
  } catch {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
}
