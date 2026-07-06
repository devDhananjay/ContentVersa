import { z } from "zod";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, REMINDER_TYPES } from "./categories";

const expenseCategoryIds = EXPENSE_CATEGORIES.map((c) => c.id) as [
  (typeof EXPENSE_CATEGORIES)[number]["id"],
  ...(typeof EXPENSE_CATEGORIES)[number]["id"][],
];

const paymentMethodIds = PAYMENT_METHODS.map((m) => m.id) as [
  (typeof PAYMENT_METHODS)[number]["id"],
  ...(typeof PAYMENT_METHODS)[number]["id"][],
];

const reminderTypeIds = REMINDER_TYPES.map((t) => t.id) as [
  (typeof REMINDER_TYPES)[number]["id"],
  ...(typeof REMINDER_TYPES)[number]["id"][],
];

export const ExpenseSchema = z.object({
  amount: z.number().int().positive().max(100_000_000),
  category: z.enum(expenseCategoryIds),
  note: z.string().trim().max(200).optional(),
  method: z.enum(paymentMethodIds).default("UPI"),
  spentAt: z.string().datetime().optional(),
});

export const BudgetSchema = z.object({
  category: z.enum(expenseCategoryIds),
  limitAmount: z.number().int().min(0).max(100_000_000),
});

export const ReminderSchema = z.object({
  type: z.enum(reminderTypeIds),
  title: z.string().trim().min(1).max(80),
  amount: z.number().int().positive().max(100_000_000).optional().nullable(),
  dueDay: z.number().int().min(1).max(31),
});
