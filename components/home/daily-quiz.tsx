"use client";

import * as React from "react";
import { Brain, Check, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type QuizOption = { id: string; label: string };

type QuizData = {
  quizKey: string;
  question: string;
  category: string;
  options: QuizOption[];
  answered: boolean;
  correct: boolean | null;
  selectedOptionId: string | null;
  correctOptionId: string | null;
  explanation: string | null;
  totalAttempts: number;
  correctPercent: number;
};

export function DailyQuizSection() {
  const [quiz, setQuiz] = React.useState<QuizData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/quizzes/daily", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { quiz?: QuizData }) => {
        if (d.quiz) setQuiz(d.quiz);
      })
      .finally(() => setLoading(false));
  }, []);

  const submit = async (optionId: string) => {
    if (!quiz || quiz.answered || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/quizzes/daily", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      const data = (await res.json()) as { quiz?: QuizData };
      if (data.quiz) setQuiz(data.quiz);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section id="daily-quiz" className="container py-12 md:py-16 scroll-mt-24">
        <div className="max-w-xl mx-auto flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (!quiz) return null;

  return (
    <section id="daily-quiz" className="container py-12 md:py-16 scroll-mt-24">
      <div className="max-w-xl mx-auto rounded-2xl border bg-card p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-4 w-4 text-neon-purple" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Quiz of the day · {quiz.category}
          </p>
        </div>
        <p className="font-display text-lg font-bold mb-5">{quiz.question}</p>

        <div className="space-y-2">
          {quiz.options.map((opt) => {
            const selected = quiz.selectedOptionId === opt.id;
            const isCorrect = quiz.correctOptionId === opt.id;
            const showResult = quiz.answered;

            return (
              <button
                key={opt.id}
                type="button"
                disabled={quiz.answered || submitting}
                onClick={() => submit(opt.id)}
                className={cn(
                  "w-full text-left rounded-xl border px-4 py-3 text-sm transition-all",
                  !showResult && "hover:border-neon-purple/50 hover:bg-muted/30",
                  showResult && isCorrect && "border-green-500/50 bg-green-500/10",
                  showResult && selected && !isCorrect && "border-red-500/50 bg-red-500/10",
                  showResult && !selected && !isCorrect && "opacity-60"
                )}
              >
                <span className="flex items-center gap-2">
                  {showResult && isCorrect ? (
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                  ) : showResult && selected && !isCorrect ? (
                    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  ) : null}
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {quiz.answered && quiz.explanation ? (
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            {quiz.explanation}
          </p>
        ) : null}

        <p className="mt-4 text-xs text-muted-foreground text-center">
          {quiz.totalAttempts > 0
            ? `${quiz.correctPercent}% got it right today (${quiz.totalAttempts.toLocaleString()} attempts)`
            : "Be the first to answer today"}
        </p>

        {quiz.answered ? (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" disabled>
              {quiz.correct ? "Correct!" : "Nice try — come back tomorrow"}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
