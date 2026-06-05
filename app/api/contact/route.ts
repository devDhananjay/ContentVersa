import { NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
});

/** Contact form — logged for now; team reads writewith@contentveres.in */
export async function POST(req: Request) {
  try {
    const body = Schema.parse(await req.json());
    console.info("[contact]", {
      at: new Date().toISOString(),
      from: body.email,
      name: body.name,
      subject: body.subject,
      preview: body.message.slice(0, 120),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Please fill all fields correctly" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
