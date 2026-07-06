import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToNewsletter } from "@/lib/newsletter/subscribe";

const Schema = z.object({
  email: z.string().email(),
  ottDigest: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, ottDigest } = Schema.parse(body);
    const result = await subscribeToNewsletter(email, { ottDigest });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 503 });
    }

    return NextResponse.json({
      ok: true,
      email,
      alreadySubscribed: result.alreadySubscribed,
      emailSent: result.emailed === true,
    });
  } catch {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
}
