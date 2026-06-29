import { NextResponse } from "next/server";
import { z } from "zod";
import { respondToHelpChat } from "@/lib/help/chat-respond";

const bodySchema = z.object({
  message: z.string().max(500).optional(),
  welcome: z.boolean().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .max(12)
    .optional(),
  pagePath: z.string().max(200).optional(),
  locale: z.enum(["en", "hi"]).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!parsed.data.welcome && !parsed.data.message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const result = await respondToHelpChat({
      message: parsed.data.message?.trim() ?? "",
      welcome: parsed.data.welcome,
      history: parsed.data.history,
      pagePath: parsed.data.pagePath,
      locale: parsed.data.locale,
    });

    return NextResponse.json({
      ok: true,
      reply: result.reply,
      source: result.source,
      links: result.links ?? [],
    });
  } catch (err) {
    console.error("[help/chat]", err);
    return NextResponse.json({ error: "Help chat failed" }, { status: 500 });
  }
}
