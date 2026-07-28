import { formatInr } from "./emi-sip";

export { formatInr };

export type TaxRegime = "new" | "old";
export type TaxpayerAge = "below60" | "senior" | "superSenior";

export type TaxCalcInput = {
  /** Annual salary / taxable employment income before standard deduction */
  grossSalary: number;
  otherIncome: number;
  age: TaxpayerAge;
  /** Old regime only */
  basicSalary?: number;
  hraReceived?: number;
  rentPaid?: number;
  metroCity?: boolean;
  deduction80C?: number;
  deduction80D?: number;
  homeLoanInterest?: number;
  /** Reduces estimated take-home only (not taxable income) */
  employeePf?: number;
  professionalTax?: number;
};

export type RegimeResult = {
  regime: TaxRegime;
  grossTotalIncome: number;
  standardDeduction: number;
  hraExemption: number;
  chapterViaDeductions: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  effectiveRatePct: number;
  monthlyTax: number;
  estimatedMonthlyInHand: number;
};

export type TaxCompareResult = {
  newRegime: RegimeResult;
  oldRegime: RegimeResult;
  better: TaxRegime;
  savings: number;
};

const NEW_SLABS: Array<{ upTo: number; rate: number }> = [
  { upTo: 400_000, rate: 0 },
  { upTo: 800_000, rate: 0.05 },
  { upTo: 1_200_000, rate: 0.1 },
  { upTo: 1_600_000, rate: 0.15 },
  { upTo: 2_000_000, rate: 0.2 },
  { upTo: 2_400_000, rate: 0.25 },
  { upTo: Infinity, rate: 0.3 },
];

function oldSlabs(age: TaxpayerAge): Array<{ upTo: number; rate: number }> {
  const nil =
    age === "superSenior" ? 500_000 : age === "senior" ? 300_000 : 250_000;
  return [
    { upTo: nil, rate: 0 },
    { upTo: 500_000, rate: 0.05 },
    { upTo: 1_000_000, rate: 0.2 },
    { upTo: Infinity, rate: 0.3 },
  ];
}

function taxFromSlabs(
  income: number,
  slabs: Array<{ upTo: number; rate: number }>
): number {
  if (income <= 0) return 0;
  let tax = 0;
  let prev = 0;
  for (const slab of slabs) {
    const span = Math.min(income, slab.upTo) - prev;
    if (span > 0) tax += span * slab.rate;
    if (income <= slab.upTo) break;
    prev = slab.upTo;
  }
  return round2(tax);
}

function surchargeAmount(
  tax: number,
  taxableIncome: number,
  regime: TaxRegime
): number {
  if (tax <= 0) return 0;
  let rate = 0;
  if (regime === "new") {
    if (taxableIncome > 2_00_00_000) rate = 0.25;
    else if (taxableIncome > 1_00_00_000) rate = 0.15;
    else if (taxableIncome > 50_00_000) rate = 0.1;
  } else {
    if (taxableIncome > 5_00_00_000) rate = 0.37;
    else if (taxableIncome > 2_00_00_000) rate = 0.25;
    else if (taxableIncome > 1_00_00_000) rate = 0.15;
    else if (taxableIncome > 50_00_000) rate = 0.1;
  }
  return round2(tax * rate);
}

/** HRA exemption u/s 10(13A) — old regime. */
export function calculateHraExemption(input: {
  basicSalary: number;
  hraReceived: number;
  rentPaid: number;
  metroCity: boolean;
}): number {
  const { basicSalary, hraReceived, rentPaid, metroCity } = input;
  if (basicSalary <= 0 || hraReceived <= 0 || rentPaid <= 0) return 0;
  const a = hraReceived;
  const b = Math.max(0, rentPaid - 0.1 * basicSalary);
  const c = (metroCity ? 0.5 : 0.4) * basicSalary;
  return round2(Math.min(a, b, c));
}

function calculateRegime(
  input: TaxCalcInput,
  regime: TaxRegime
): RegimeResult {
  const grossSalary = Math.max(0, input.grossSalary);
  const otherIncome = Math.max(0, input.otherIncome);
  const standardDeduction =
    regime === "new" ? 75_000 : 50_000;

  const hraExemption =
    regime === "old"
      ? calculateHraExemption({
          basicSalary: Math.max(0, input.basicSalary ?? 0),
          hraReceived: Math.max(0, input.hraReceived ?? 0),
          rentPaid: Math.max(0, input.rentPaid ?? 0),
          metroCity: Boolean(input.metroCity),
        })
      : 0;

  const d80C =
    regime === "old" ? Math.min(150_000, Math.max(0, input.deduction80C ?? 0)) : 0;
  const d80D =
    regime === "old" ? Math.min(100_000, Math.max(0, input.deduction80D ?? 0)) : 0;
  const homeLoan =
    regime === "old"
      ? Math.min(200_000, Math.max(0, input.homeLoanInterest ?? 0))
      : 0;
  const chapterViaDeductions = round2(d80C + d80D + homeLoan);

  const salaryAfterExemptions = Math.max(
    0,
    grossSalary - standardDeduction - hraExemption
  );
  const grossTotalIncome = round2(salaryAfterExemptions + otherIncome);
  const taxableIncome = Math.max(
    0,
    round2(grossTotalIncome - chapterViaDeductions)
  );

  const taxBeforeRebate =
    regime === "new"
      ? taxFromSlabs(taxableIncome, NEW_SLABS)
      : taxFromSlabs(taxableIncome, oldSlabs(input.age));

  let rebate87A = 0;
  if (regime === "new" && taxableIncome <= 1_200_000) {
    rebate87A = Math.min(taxBeforeRebate, 60_000);
  } else if (regime === "old" && taxableIncome <= 500_000) {
    rebate87A = Math.min(taxBeforeRebate, 12_500);
  }

  const taxAfterRebate = Math.max(0, round2(taxBeforeRebate - rebate87A));
  const surcharge = surchargeAmount(taxAfterRebate, taxableIncome, regime);
  const cess = round2((taxAfterRebate + surcharge) * 0.04);
  const totalTax = round2(taxAfterRebate + surcharge + cess);

  const totalIncomeForRate = grossSalary + otherIncome;
  const effectiveRatePct =
    totalIncomeForRate > 0
      ? round2((totalTax / totalIncomeForRate) * 100)
      : 0;

  const employeePf = Math.max(0, input.employeePf ?? 0);
  const professionalTax = Math.max(0, input.professionalTax ?? 0);
  const annualTakeHome = Math.max(
    0,
    grossSalary + otherIncome - totalTax - employeePf - professionalTax
  );

  return {
    regime,
    grossTotalIncome,
    standardDeduction,
    hraExemption,
    chapterViaDeductions,
    taxableIncome,
    taxBeforeRebate,
    rebate87A,
    taxAfterRebate,
    surcharge,
    cess,
    totalTax,
    effectiveRatePct,
    monthlyTax: round2(totalTax / 12),
    estimatedMonthlyInHand: round2(annualTakeHome / 12),
  };
}

export function compareIncomeTax(input: TaxCalcInput): TaxCompareResult | null {
  if (input.grossSalary <= 0 && input.otherIncome <= 0) return null;
  const newRegime = calculateRegime(input, "new");
  const oldRegime = calculateRegime(input, "old");
  const better: TaxRegime =
    newRegime.totalTax <= oldRegime.totalTax ? "new" : "old";
  const savings = Math.abs(newRegime.totalTax - oldRegime.totalTax);
  return { newRegime, oldRegime, better, savings: round2(savings) };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** FY label shown in UI / SEO copy. */
export const TAX_FY_LABEL = "FY 2026–27 (AY 2027–28)";
