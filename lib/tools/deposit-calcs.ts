/** Deposit & GST calculators — client-safe math. */

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Compound FD: A = P (1 + r/n)^(n*t) — quarterly compounding default for Indian banks. */
export function calculateFd(input: {
  principal: number;
  annualRate: number;
  years: number;
  compoundsPerYear?: number;
}): { invested: number; interest: number; maturity: number } | null {
  const { principal, annualRate, years } = input;
  const n = input.compoundsPerYear ?? 4;
  if (principal <= 0 || years <= 0 || annualRate < 0 || n <= 0) return null;
  const maturity = principal * Math.pow(1 + annualRate / 100 / n, n * years);
  return {
    invested: round2(principal),
    interest: round2(maturity - principal),
    maturity: round2(maturity),
  };
}

/** Recurring deposit — monthly deposits with monthly compounding approximation. */
export function calculateRd(input: {
  monthlyDeposit: number;
  annualRate: number;
  months: number;
}): { invested: number; interest: number; maturity: number } | null {
  const { monthlyDeposit, annualRate, months } = input;
  if (monthlyDeposit <= 0 || months <= 0 || annualRate < 0) return null;
  const r = annualRate / 100 / 12;
  const invested = monthlyDeposit * months;
  let maturity = 0;
  if (r === 0) {
    maturity = invested;
  } else {
    // Each deposit compounds for remaining months
    for (let i = 0; i < months; i++) {
      maturity += monthlyDeposit * Math.pow(1 + r, months - i);
    }
  }
  return {
    invested: round2(invested),
    interest: round2(maturity - invested),
    maturity: round2(maturity),
  };
}

/**
 * PPF — annual deposits, compounding annually at given rate.
 * Indian PPF is 15-year lock; we allow custom years for planning.
 */
export function calculatePpf(input: {
  yearlyDeposit: number;
  annualRate: number;
  years: number;
}): { invested: number; interest: number; maturity: number } | null {
  const { yearlyDeposit, annualRate, years } = input;
  if (yearlyDeposit <= 0 || years <= 0 || annualRate < 0) return null;
  const r = annualRate / 100;
  let balance = 0;
  for (let y = 0; y < years; y++) {
    balance = (balance + yearlyDeposit) * (1 + r);
  }
  const invested = yearlyDeposit * years;
  return {
    invested: round2(invested),
    interest: round2(balance - invested),
    maturity: round2(balance),
  };
}

export type GstMode = "exclusive" | "inclusive";

export function calculateGst(input: {
  amount: number;
  ratePercent: number;
  mode: GstMode;
}): {
  base: number;
  gst: number;
  total: number;
  cgst: number;
  sgst: number;
} | null {
  const { amount, ratePercent, mode } = input;
  if (amount <= 0 || ratePercent < 0) return null;
  const r = ratePercent / 100;
  let base: number;
  let gst: number;
  let total: number;
  if (mode === "exclusive") {
    base = amount;
    gst = amount * r;
    total = amount + gst;
  } else {
    total = amount;
    base = amount / (1 + r);
    gst = total - base;
  }
  return {
    base: round2(base),
    gst: round2(gst),
    total: round2(total),
    cgst: round2(gst / 2),
    sgst: round2(gst / 2),
  };
}
