import { NextResponse } from "next/server";
import { z } from "zod";
import { respondToCvAiChat } from "@/lib/ai/cv-ai-respond";
import { CV_AI_MODES } from "@/lib/ai/cv-ai-modes";

const modeSet = new Set(CV_AI_MODES.map((m) => m.id));

const bodySchema = z.object({
  message: z.string().max(12000),
  mode: z.string().max(40).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      })
    )
    .max(12)
    .optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const mode =
      parsed.data.mode && modeSet.has(parsed.data.mode as never)
        ? parsed.data.mode
        : "ask";

    const result = await respondToCvAiChat({
      message: parsed.data.message,
      mode,
      history: parsed.data.history,
    });

    return NextResponse.json({
      ok: true,
      reply: result.reply,
      source: result.source,
      links: result.links ?? [],
    });
  } catch (err) {
    console.error("[ai/chat]", err);
    return NextResponse.json({ error: "ContentVerse AI failed" }, { status: 500 });
  }
}
