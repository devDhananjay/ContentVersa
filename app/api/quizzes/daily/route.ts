import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { getDailyQuizDto, submitDailyQuizAnswer } from "@/lib/data/quizzes";

const AnswerSchema = z.object({ optionId: z.string().min(1) });

function visitorKey() {
  return `qv_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export async function GET() {
  const session = await getCurrentUser();
  const userId = session ? await resolveUserId(session) : null;
  const jar = await cookies();
  const key = jar.get("cv_quiz_visitor")?.value ?? null;

  const quiz = await getDailyQuizDto({ userId, visitorKey: key });
  return NextResponse.json({ quiz });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { optionId } = AnswerSchema.parse(body);

    const session = await getCurrentUser();
    const userId = session ? await resolveUserId(session) : null;
    const jar = await cookies();
    let key = jar.get("cv_quiz_visitor")?.value;
    const isNew = !key;
    if (!userId && !key) key = visitorKey();

    const quiz = await submitDailyQuizAnswer({
      selectedOptionId: optionId,
      userId,
      visitorKey: userId ? null : key,
    });

    const res = NextResponse.json({ ok: true, quiz });
    if (isNew && key && !userId) {
      res.cookies.set("cv_quiz_visitor", key, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "INVALID_OPTION") {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 });
    }
    console.error("[quiz daily]", err);
    return NextResponse.json({ error: "Quiz submit failed" }, { status: 500 });
  }
}
