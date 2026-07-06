import type { MoneyExpenseCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseMonthKey } from "./dates";
import type { MoneyMonthSummary } from "./types";
import { toExpenseDto, toReminderDto } from "./types";

export async function getMoneyMonthSummary(
  userId: string,
  month: string
): Promise<MoneyMonthSummary> {
  const range = parseMonthKey(month);
  if (!range) throw new Error("Invalid month");

  const [expenses, budgets, reminders] = await Promise.all([
    prisma.moneyExpense.findMany({
      where: {
        userId,
        spentAt: { gte: range.start, lte: range.end },
      },
      orderBy: { spentAt: "desc" },
    }),
    prisma.moneyBudget.findMany({ where: { userId } }),
    prisma.moneyReminder.findMany({
      where: { userId, isActive: true },
      orderBy: { dueDay: "asc" },
    }),
  ]);

  const spentByCategory = new Map<MoneyExpenseCategory, { amount: number; count: number }>();
  for (const e of expenses) {
    const cur = spentByCategory.get(e.category) ?? { amount: 0, count: 0 };
    cur.amount += e.amount;
    cur.count += 1;
    spentByCategory.set(e.category, cur);
  }

  const budgetRows = budgets.map((b) => {
    const spent = spentByCategory.get(b.category)?.amount ?? 0;
    const remaining = Math.max(0, b.limitAmount - spent);
    const percentUsed =
      b.limitAmount > 0 ? Math.min(100, Math.round((spent / b.limitAmount) * 100)) : 0;
    return {
      category: b.category,
      limitAmount: b.limitAmount,
      spent,
      remaining,
      percentUsed,
    };
  });

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const totalBudget = budgets.reduce((s, b) => s + b.limitAmount, 0);
  const budgetSpentOnBudgeted = budgetRows.reduce((s, b) => s + b.spent, 0);

  return {
    month,
    loggedIn: true,
    totalSpent,
    expenseCount: expenses.length,
    budgets: budgetRows,
    byCategory: [...spentByCategory.entries()]
      .map(([category, v]) => ({ category, amount: v.amount, count: v.count }))
      .sort((a, b) => b.amount - a.amount),
    expenses: expenses.map(toExpenseDto),
    reminders: reminders.map(toReminderDto),
    totalBudget,
    budgetRemaining: Math.max(0, totalBudget - budgetSpentOnBudgeted),
  };
}

export function emptyMonthSummary(month: string): MoneyMonthSummary {
  return {
    month,
    loggedIn: false,
    totalSpent: 0,
    expenseCount: 0,
    budgets: [],
    byCategory: [],
    expenses: [],
    reminders: [],
    totalBudget: 0,
    budgetRemaining: 0,
  };
}
