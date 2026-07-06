import { callGeminiVisionJson, isGeminiConfigured } from "@/lib/ai/gemini";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "./categories";
import type { MoneyExpenseCategory, MoneyPaymentMethod } from "@prisma/client";

export type ScreenshotScanResult = {
  amount: number;
  note: string;
  category: MoneyExpenseCategory;
  method: MoneyPaymentMethod;
  spentAt?: string;
  source: "gemini" | "unavailable";
};

const CATEGORY_IDS = EXPENSE_CATEGORIES.map((c) => c.id);
const METHOD_IDS = PAYMENT_METHODS.map((m) => m.id);

const SCAN_SCHEMA = {
  type: "object",
  properties: {
    amount: {
      type: "integer",
      description: "Total paid amount in Indian Rupees (whole rupees, no paise fraction)",
    },
    note: {
      type: "string",
      description: "Merchant, payee, or transaction description (short)",
    },
    category: {
      type: "string",
      enum: CATEGORY_IDS,
      description: "Best expense category for this payment",
    },
    method: {
      type: "string",
      enum: METHOD_IDS,
      description: "Payment method used",
    },
    spentAt: {
      type: "string",
      description: "ISO 8601 datetime if visible on screenshot, else omit",
    },
  },
  required: ["amount", "note", "category", "method"],
};

const SYSTEM = `You extract expense details from Indian payment screenshots (UPI apps like PhonePe, Google Pay, Paytm, BHIM, bank SMS screenshots, credit card payment confirmations).

Rules:
- amount: the final debited/paid amount in ₹ (integer rupees). If both ₹ and paise shown, round to nearest rupee.
- note: payee or merchant name (max 80 chars).
- category: pick the closest category from the allowed enum.
- method: usually UPI for UPI apps; CARD for card payments; NET_BANKING for IMPS/NEFT; CASH only if clearly cash.
- spentAt: only if date/time is clearly visible, ISO 8601 format.
- If not a payment screenshot or unreadable, set amount to 0 and note to "unreadable".`;

type RawScan = {
  amount?: number;
  note?: string;
  category?: string;
  method?: string;
  spentAt?: string;
};

function normalizeCategory(value: string | undefined): MoneyExpenseCategory {
  const hit = CATEGORY_IDS.find((id) => id === value);
  return hit ?? "OTHER";
}

function normalizeMethod(value: string | undefined): MoneyPaymentMethod {
  const hit = METHOD_IDS.find((id) => id === value);
  return hit ?? "UPI";
}

export function isScreenshotScanConfigured() {
  return isGeminiConfigured();
}

export async function scanExpenseScreenshot(
  mimeType: string,
  base64: string
): Promise<ScreenshotScanResult | null> {
  if (!isGeminiConfigured()) return null;

  const parsed = await callGeminiVisionJson<RawScan>(
    SYSTEM,
    "Extract the expense from this payment screenshot.",
    { mimeType, data: base64 },
    SCAN_SCHEMA
  );

  if (!parsed?.amount || parsed.amount <= 0) return null;
  if (parsed.note?.toLowerCase() === "unreadable") return null;

  let spentAt: string | undefined;
  if (parsed.spentAt) {
    const d = new Date(parsed.spentAt);
    if (!Number.isNaN(d.getTime())) spentAt = d.toISOString();
  }

  return {
    amount: Math.round(parsed.amount),
    note: (parsed.note || "Payment").slice(0, 200),
    category: normalizeCategory(parsed.category),
    method: normalizeMethod(parsed.method),
    spentAt,
    source: "gemini",
  };
}
