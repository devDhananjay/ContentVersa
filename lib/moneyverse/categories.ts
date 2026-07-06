import type { MoneyExpenseCategory } from "@prisma/client";

export const EXPENSE_CATEGORIES: {
  id: MoneyExpenseCategory;
  label: string;
  emoji: string;
}[] = [
  { id: "FOOD", label: "Food & dining", emoji: "🍽️" },
  { id: "TRANSPORT", label: "Transport", emoji: "🚗" },
  { id: "SHOPPING", label: "Shopping", emoji: "🛍️" },
  { id: "BILLS", label: "Bills & utilities", emoji: "📱" },
  { id: "ENTERTAINMENT", label: "Entertainment", emoji: "🎬" },
  { id: "HEALTH", label: "Health", emoji: "💊" },
  { id: "EDUCATION", label: "Education", emoji: "📚" },
  { id: "INVESTMENT", label: "Investments", emoji: "📈" },
  { id: "RENT", label: "Rent & housing", emoji: "🏠" },
  { id: "OTHER", label: "Other", emoji: "📦" },
];

export const PAYMENT_METHODS = [
  { id: "UPI" as const, label: "UPI" },
  { id: "CASH" as const, label: "Cash" },
  { id: "CARD" as const, label: "Card" },
  { id: "NET_BANKING" as const, label: "Net banking" },
  { id: "OTHER" as const, label: "Other" },
];

export const REMINDER_TYPES = [
  { id: "CREDIT_CARD" as const, label: "Credit card due" },
  { id: "SIP" as const, label: "SIP" },
  { id: "CUSTOM" as const, label: "Custom" },
];

export function categoryLabel(id: MoneyExpenseCategory) {
  return EXPENSE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function categoryEmoji(id: MoneyExpenseCategory) {
  return EXPENSE_CATEGORIES.find((c) => c.id === id)?.emoji ?? "📦";
}
