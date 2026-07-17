import type {
  BankStatementAnalysis,
  BankStatementTransaction,
} from "@/lib/moneyverse/bank-statement-analyzer";

type ParsedMoney = { amount: number; raw: string };

/**
 * Deterministic parser for Indian e-statement text (HDFC-style columns).
 * Used when Gemini is unavailable / rate-limited so long PDFs still work.
 */
export function parseBankStatementText(raw: string): BankStatementAnalysis | null {
  const text = raw.replace(/\r/g, "\n");
  if (text.length < 80) return null;

  const transactions = extractTransactions(text);
  if (transactions.length < 1) return null;

  const credits = transactions.filter((t) => t.type === "CREDIT");
  const debits = transactions.filter((t) => t.type === "DEBIT");
  const totalCredits = roundMoney(credits.reduce((s, t) => s + t.amount, 0));
  const totalDebits = roundMoney(debits.reduce((s, t) => s + t.amount, 0));

  const categoryTotals = new Map<string, number>();
  for (const row of debits) {
    categoryTotals.set(row.category, (categoryTotals.get(row.category) || 0) + row.amount);
  }
  const topExpenseCategories = [...categoryTotals.entries()]
    .map(([category, amount]) => ({ category, amount: roundMoney(amount) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  const bankCharges = roundMoney(
    debits
      .filter((t) => t.category === "Bank Charges")
      .reduce((s, t) => s + t.amount, 0)
  );

  const periodStart = transactions[0]?.date;
  const periodEnd = transactions[transactions.length - 1]?.date;
  const openingBalance =
    transactions[0]?.balance != null
      ? roundMoney(
          transactions[0].type === "CREDIT"
            ? transactions[0].balance - transactions[0].amount
            : transactions[0].balance + transactions[0].amount
        )
      : undefined;
  const closingBalance = transactions[transactions.length - 1]?.balance;

  const warnings: string[] = [];
  if (transactions.length >= 100) {
    warnings.push("Showing first 100 transactions; statement may contain more.");
  }

  return {
    accountHolder: extractAccountHolder(text),
    bankName: extractBankName(text),
    accountNumberMasked: maskAccount(extractAccountNumber(text)),
    periodStart,
    periodEnd,
    openingBalance,
    closingBalance,
    totalCredits,
    totalDebits,
    creditCount: credits.length,
    debitCount: debits.length,
    netCashFlow: roundMoney(totalCredits - totalDebits),
    topExpenseCategories,
    recurringPayments: detectRecurring(debits),
    bankCharges,
    summary: buildSummary({
      bankName: extractBankName(text),
      totalCredits,
      totalDebits,
      creditCount: credits.length,
      debitCount: debits.length,
      periodStart,
      periodEnd,
    }),
    transactions: transactions.slice(0, 100),
    warnings,
    source: "local",
  };
}

function extractTransactions(text: string): BankStatementTransaction[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const joined = lines.join("\n");

  // HDFC often concatenates: DD/MM/YY + narration + DD/MM/YY + amt + balance
  const rowRe =
    /(\d{2}\/\d{2}\/\d{2})([^\n]*?)(\d{2}\/\d{2}\/\d{2})((?:\d{1,3}(?:,\d{2,3})*\.\d{2}){1,2})/g;

  const rows: BankStatementTransaction[] = [];
  let match: RegExpExecArray | null;
  let previousBalance: number | undefined;

  while ((match = rowRe.exec(joined)) !== null) {
    const dateRaw = match[1];
    let narration = cleanNarration(match[2]);
    const amounts = parseTrailingAmounts(match[4]);
    if (amounts.length < 1) continue;

    const balance = amounts[amounts.length - 1].amount;
    const txnAmount =
      amounts.length >= 2 ? amounts[0].amount : guessAmountFromBalance(previousBalance, balance);
    if (!txnAmount || txnAmount <= 0) {
      previousBalance = balance;
      continue;
    }

    // Continuation lines often append UPI ref fragments into narration — keep short.
    narration = narration.replace(/\s+/g, " ").slice(0, 160);
    if (!narration || /^(page no|statement of|mr\.?|ms\.?|joint holders)/i.test(narration)) {
      previousBalance = balance;
      continue;
    }

    let type: "CREDIT" | "DEBIT" = "DEBIT";
    if (previousBalance != null) {
      if (balance > previousBalance + 0.001) type = "CREDIT";
      else if (balance < previousBalance - 0.001) type = "DEBIT";
      else type = inferTypeFromNarration(narration);
    } else {
      type = inferTypeFromNarration(narration);
    }

    // If two amounts and balance rose, treat first amount as credit (deposit column).
    if (amounts.length >= 2 && previousBalance != null) {
      if (Math.abs(previousBalance + txnAmount - balance) < 0.05) type = "CREDIT";
      if (Math.abs(previousBalance - txnAmount - balance) < 0.05) type = "DEBIT";
    }

    rows.push({
      date: toIsoDate(dateRaw),
      description: narration || "Transaction",
      type,
      amount: roundMoney(txnAmount),
      category: categorize(narration, type),
      balance: roundMoney(balance),
    });
    previousBalance = balance;
  }

  return rows;
}

function parseTrailingAmounts(chunk: string): ParsedMoney[] {
  const found = chunk.match(/\d{1,3}(?:,\d{2,3})*\.\d{2}/g) || [];
  return found.map((raw) => ({ raw, amount: Number(raw.replace(/,/g, "")) })).filter((a) =>
    Number.isFinite(a.amount)
  );
}

function guessAmountFromBalance(prev: number | undefined, next: number) {
  if (prev == null) return 0;
  return roundMoney(Math.abs(next - prev));
}

function cleanNarration(value: string) {
  return value
    .replace(/^\d+/, "")
    .replace(/Chq\.?\/?Ref\.?No\.?/gi, " ")
    .replace(/Value Dt/gi, " ")
    .replace(/Withdrawal Amt\.?/gi, " ")
    .replace(/Deposit Amt\.?/gi, " ")
    .replace(/Closing Balance/gi, " ")
    .replace(/[|]+/g, " ")
    .trim();
}

function inferTypeFromNarration(narration: string): "CREDIT" | "DEBIT" {
  if (
    /\b(salary|interest|refund|cashback|neft.?cr|imps.?cr|upi.?cr|credit|deposit|received)\b/i.test(
      narration
    )
  ) {
    return "CREDIT";
  }
  return "DEBIT";
}

function categorize(narration: string, type: "CREDIT" | "DEBIT"): string {
  const n = narration.toLowerCase();
  if (type === "CREDIT") {
    if (/salary|payroll/.test(n)) return "Salary";
    if (/interest/.test(n)) return "Interest";
    if (/refund|cashback|reversal/.test(n)) return "Refund";
    return "Transfer";
  }
  if (/charge|fee|gst|sms.?alert|annual/.test(n)) return "Bank Charges";
  if (/atm|cash.?wdl|cwdr/.test(n)) return "Cash Withdrawal";
  if (/swiggy|zomato|blinkit|zepto|food|restaurant|cafe|dhaba|pharmacy|medical/.test(n))
    return /pharmacy|medical|hospital|apollo/.test(n) ? "Health" : "Food";
  if (/amazon|flipkart|myntra|ajio|shopping|store/.test(n)) return "Shopping";
  if (/uber|ola|metro|irctc|petrol|fuel|fastag/.test(n)) return "Transport";
  if (/electric|broadband|airtel|jio|vi-|bill|recharge|gas/.test(n)) return "Bills";
  if (/rent|house.?rent/.test(n)) return "Rent";
  if (/mutual.?fund|groww|zerodha|upstox|sip|investment/.test(n)) return "Investment";
  if (/upi-|imps|neft|rtgs|transfer|paytm|phonepe|gpay|@ybl|@ok/.test(n)) return "Transfer";
  return "Other";
}

function detectRecurring(debits: BankStatementTransaction[]) {
  const map = new Map<string, { amount: number; count: number }>();
  for (const row of debits) {
    const key = row.description.replace(/\d+/g, "").slice(0, 40).trim().toLowerCase();
    if (!key) continue;
    const prev = map.get(key);
    if (!prev) map.set(key, { amount: row.amount, count: 1 });
    else map.set(key, { amount: prev.amount, count: prev.count + 1 });
  }
  return [...map.entries()]
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([description, v]) => ({
      description: description.slice(0, 60),
      amount: roundMoney(v.amount),
      frequency: `${v.count}x in statement`,
    }));
}

function extractBankName(text: string) {
  if (/hdfc\s*bank/i.test(text)) return "HDFC Bank";
  if (/state bank of india|\bsbi\b/i.test(text)) return "State Bank of India";
  if (/icici\s*bank/i.test(text)) return "ICICI Bank";
  if (/axis\s*bank/i.test(text)) return "Axis Bank";
  if (/kotak/i.test(text)) return "Kotak Mahindra Bank";
  return undefined;
}

function extractAccountHolder(text: string) {
  const m =
    text.match(/\n(MR\.?\s+[A-Z][A-Z\s\.]+)\n/) ||
    text.match(/\n(MS\.?\s+[A-Z][A-Z\s\.]+)\n/) ||
    text.match(/Account Holder\s*[:\-]?\s*([A-Za-z .]+)/i);
  return m?.[1]?.trim().replace(/\s+/g, " ").slice(0, 80);
}

function extractAccountNumber(text: string) {
  const m = text.match(/Account\s*No\.?\s*[:\-]?\s*([0-9\s]+)/i);
  return m?.[1]?.replace(/\s+/g, "");
}

function maskAccount(value?: string) {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return undefined;
  return `••••${digits.slice(-4)}`;
}

function toIsoDate(ddmmyy: string) {
  const [dd, mm, yy] = ddmmyy.split("/");
  const year = Number(yy) >= 70 ? `19${yy}` : `20${yy}`;
  return `${year}-${mm}-${dd}`;
}

function buildSummary(input: {
  bankName?: string;
  totalCredits: number;
  totalDebits: number;
  creditCount: number;
  debitCount: number;
  periodStart?: string;
  periodEnd?: string;
}) {
  const bank = input.bankName || "Bank";
  const period =
    input.periodStart && input.periodEnd
      ? ` from ${input.periodStart} to ${input.periodEnd}`
      : "";
  return `${bank} statement${period}: ₹${input.totalCredits.toLocaleString("en-IN")} credited across ${input.creditCount} transactions and ₹${input.totalDebits.toLocaleString("en-IN")} debited across ${input.debitCount} transactions.`;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
