import type {
  MoneyExpense,
  MoneyExpenseCategory,
  MoneyPaymentMethod,
  MoneyReminder,
  MoneyReminderType,
} from "@prisma/client";

export type MoneyExpenseDto = {
  id: string;
  amount: number;
  category: MoneyExpenseCategory;
  note: string | null;
  method: MoneyPaymentMethod;
  spentAt: string;
};

export type MoneyBudgetDto = {
  category: MoneyExpenseCategory;
  limitAmount: number;
  spent: number;
  remaining: number;
  percentUsed: number;
};

export type MoneyReminderDto = {
  id: string;
  type: MoneyReminderType;
  title: string;
  amount: number | null;
  dueDay: number;
  isActive: boolean;
  daysUntilDue: number;
};

export type MoneyMonthSummary = {
  month: string;
  loggedIn: boolean;
  error?: string;
  totalSpent: number;
  expenseCount: number;
  budgets: MoneyBudgetDto[];
  byCategory: { category: MoneyExpenseCategory; amount: number; count: number }[];
  expenses: MoneyExpenseDto[];
  reminders: MoneyReminderDto[];
  totalBudget: number;
  budgetRemaining: number;
};

export function toExpenseDto(row: MoneyExpense): MoneyExpenseDto {
  return {
    id: row.id,
    amount: row.amount,
    category: row.category,
    note: row.note,
    method: row.method,
    spentAt: row.spentAt.toISOString(),
  };
}

export function toReminderDto(row: MoneyReminder): MoneyReminderDto {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let due = new Date(now.getFullYear(), now.getMonth(), row.dueDay);
  if (due < todayStart) {
    due = new Date(now.getFullYear(), now.getMonth() + 1, row.dueDay);
  }
  const daysUntilDue = Math.max(
    0,
    Math.ceil((due.getTime() - todayStart.getTime()) / 86_400_000)
  );
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    amount: row.amount,
    dueDay: row.dueDay,
    isActive: row.isActive,
    daysUntilDue,
  };
}
