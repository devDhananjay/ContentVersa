import { formatInr } from "@/lib/tools/emi-sip";

export { formatInr };

/** Suggest term cover from income, liabilities, and existing cover (educational). */
export function estimateTermCover(input: {
  annualTakeHome: number;
  yearsOfSupport: number;
  outstandingLoans: number;
  existingCover: number;
}): { rawNeed: number; suggestedCover: number; incomeMultiple: number } | null {
  const { annualTakeHome, yearsOfSupport, outstandingLoans, existingCover } = input;
  if (annualTakeHome <= 0 || yearsOfSupport <= 0) return null;

  const incomeMultiple = annualTakeHome * yearsOfSupport;
  const rawNeed = incomeMultiple + Math.max(0, outstandingLoans) - Math.max(0, existingCover);
  const suggestedCover = Math.max(0, Math.ceil(rawNeed / 100000) * 100000);

  return {
    rawNeed: Math.round(rawNeed),
    suggestedCover,
    incomeMultiple: Math.round(incomeMultiple),
  };
}

/** Illustrative annual premium from ₹ per lakh of cover (user-entered market quote). */
export function estimateTermPremium(input: {
  cover: number;
  rupeesPerLakhPerYear: number;
}): number | null {
  const { cover, rupeesPerLakhPerYear } = input;
  if (cover <= 0 || rupeesPerLakhPerYear < 0) return null;
  return Math.round((cover / 100000) * rupeesPerLakhPerYear);
}

export type TakeHomeInput = {
  basicPay: number;
  daPercent: number;
  hraPercent: number;
  otherAllowances: number;
  pfPercent: number;
  otherDeductions: number;
  tds: number;
};

export type TakeHomeResult = {
  da: number;
  hra: number;
  gross: number;
  pf: number;
  totalDeductions: number;
  net: number;
};

/** Central/SSC-style slip: DA & HRA as % of basic; PF as % of (basic+DA) by default. */
export function calculateTakeHome(input: TakeHomeInput): TakeHomeResult | null {
  const {
    basicPay,
    daPercent,
    hraPercent,
    otherAllowances,
    pfPercent,
    otherDeductions,
    tds,
  } = input;
  if (basicPay <= 0) return null;

  const da = round2((basicPay * Math.max(0, daPercent)) / 100);
  const hra = round2((basicPay * Math.max(0, hraPercent)) / 100);
  const gross = round2(basicPay + da + hra + Math.max(0, otherAllowances));
  const pf = round2(((basicPay + da) * Math.max(0, pfPercent)) / 100);
  const totalDeductions = round2(pf + Math.max(0, otherDeductions) + Math.max(0, tds));
  const net = round2(gross - totalDeductions);

  return { da, hra, gross, pf, totalDeductions, net };
}

export type EpfInput = {
  currentBalance: number;
  monthlyEmployee: number;
  monthlyEmployer: number;
  annualRate: number;
  years: number;
};

export type EpfResult = {
  totalContributed: number;
  projectedBalance: number;
  estimatedInterest: number;
};

/**
 * Simple month-end compounding projection for EPF-style contributions.
 * Illustrative only — not EPFO passbook math.
 */
export function projectEpf(input: EpfInput): EpfResult | null {
  const { currentBalance, monthlyEmployee, monthlyEmployer, annualRate, years } =
    input;
  if (years <= 0 || annualRate < 0) return null;
  if (currentBalance < 0 || monthlyEmployee < 0 || monthlyEmployer < 0) return null;

  const months = Math.floor(years * 12);
  const monthlyRate = annualRate / 12 / 100;
  const monthlyIn = monthlyEmployee + monthlyEmployer;
  let bal = currentBalance;
  let contributed = 0;

  for (let i = 0; i < months; i++) {
    bal = bal * (1 + monthlyRate) + monthlyIn;
    contributed += monthlyIn;
  }

  const projectedBalance = round2(bal);
  const totalContributed = round2(contributed);
  return {
    totalContributed,
    projectedBalance,
    estimatedInterest: round2(projectedBalance - currentBalance - totalContributed),
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
