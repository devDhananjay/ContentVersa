import { QUIZ_BANK, type DailyQuiz } from "@/lib/quizzes/catalog";

export function getDailyQuizKey(date = new Date()): string {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  const quiz = QUIZ_BANK[dayIndex % QUIZ_BANK.length];
  return `daily-${quiz.key}-${dayIndex}`;
}

export function getDailyQuiz(date = new Date()): DailyQuiz & { quizKey: string } {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  const quiz = QUIZ_BANK[dayIndex % QUIZ_BANK.length];
  return {
    ...quiz,
    quizKey: `daily-${quiz.key}-${dayIndex}`,
  };
}
