import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getDailyQuiz } from "@/lib/quizzes/daily";

export type QuizDto = {
  quizKey: string;
  question: string;
  category: string;
  options: { id: string; label: string }[];
  answered: boolean;
  correct: boolean | null;
  selectedOptionId: string | null;
  correctOptionId: string | null;
  explanation: string | null;
  totalAttempts: number;
  correctPercent: number;
};

export async function getDailyQuizDto(opts: {
  userId?: string | null;
  visitorKey?: string | null;
}): Promise<QuizDto> {
  const quiz = getDailyQuiz();
  const base = {
    quizKey: quiz.quizKey,
    question: quiz.question,
    category: quiz.category,
    options: quiz.options.map((o) => ({ id: o.id, label: o.label })),
    answered: false,
    correct: null as boolean | null,
    selectedOptionId: null as string | null,
    correctOptionId: null as string | null,
    explanation: null as string | null,
    totalAttempts: 0,
    correctPercent: 0,
  };

  if (!isDatabaseConfigured()) return base;

  const attempt = await findAttempt(quiz.quizKey, opts.userId, opts.visitorKey);
  const stats = await prisma.quizAttempt.groupBy({
    by: ["correct"],
    where: { quizKey: quiz.quizKey },
    _count: { _all: true },
  });
  const totalAttempts = stats.reduce((s, r) => s + r._count._all, 0);
  const correctCount = stats.find((r) => r.correct)?._count._all ?? 0;

  return {
    ...base,
    answered: Boolean(attempt),
    correct: attempt?.correct ?? null,
    selectedOptionId: attempt?.selectedOptionId ?? null,
    correctOptionId: attempt ? quiz.correctOptionId : null,
    explanation: attempt ? quiz.explanation : null,
    totalAttempts,
    correctPercent: totalAttempts ? Math.round((correctCount / totalAttempts) * 100) : 0,
  };
}

async function findAttempt(
  quizKey: string,
  userId?: string | null,
  visitorKey?: string | null
) {
  if (userId) {
    return prisma.quizAttempt.findUnique({
      where: { quizKey_userId: { quizKey, userId } },
    });
  }
  if (visitorKey) {
    return prisma.quizAttempt.findUnique({
      where: { quizKey_visitorKey: { quizKey, visitorKey } },
    });
  }
  return null;
}

export async function submitDailyQuizAnswer(opts: {
  selectedOptionId: string;
  userId?: string | null;
  visitorKey?: string | null;
}): Promise<QuizDto> {
  const quiz = getDailyQuiz();
  const option = quiz.options.find((o) => o.id === opts.selectedOptionId);
  if (!option) throw new Error("INVALID_OPTION");

  if (!opts.userId && !opts.visitorKey) throw new Error("IDENTITY_REQUIRED");

  const correct = opts.selectedOptionId === quiz.correctOptionId;

  if (isDatabaseConfigured()) {
    const data = {
      quizKey: quiz.quizKey,
      selectedOptionId: opts.selectedOptionId,
      correct,
      userId: opts.userId ?? null,
      visitorKey: opts.visitorKey ?? null,
    };

    if (opts.userId) {
      await prisma.quizAttempt.upsert({
        where: { quizKey_userId: { quizKey: quiz.quizKey, userId: opts.userId } },
        create: data,
        update: { selectedOptionId: opts.selectedOptionId, correct },
      });
    } else if (opts.visitorKey) {
      await prisma.quizAttempt.upsert({
        where: { quizKey_visitorKey: { quizKey: quiz.quizKey, visitorKey: opts.visitorKey } },
        create: data,
        update: { selectedOptionId: opts.selectedOptionId, correct },
      });
    }
  }

  return getDailyQuizDto(opts);
}
