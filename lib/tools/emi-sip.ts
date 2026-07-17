export type EmiInput = {
  principal: number;
  annualRate: number;
  tenureMonths: number;
};

export type EmiResult = {
  emi: number;
  totalPayment: number;
  totalInterest: number;
};

export type SipInput = {
  monthlyInvestment: number;
  annualReturn: number;
  years: number;
};

export type SipResult = {
  invested: number;
  estimatedReturns: number;
  maturityValue: number;
};

export function calculateEmi(input: EmiInput): EmiResult | null {
  const { principal, annualRate, tenureMonths } = input;
  if (principal <= 0 || tenureMonths <= 0 || annualRate < 0) return null;

  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    const emi = principal / tenureMonths;
    return {
      emi: round2(emi),
      totalPayment: round2(principal),
      totalInterest: 0,
    };
  }

  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  const totalPayment = emi * tenureMonths;
  return {
    emi: round2(emi),
    totalPayment: round2(totalPayment),
    totalInterest: round2(totalPayment - principal),
  };
}

export function calculateSip(input: SipInput): SipResult | null {
  const { monthlyInvestment, annualReturn, years } = input;
  if (monthlyInvestment <= 0 || years <= 0 || annualReturn < 0) return null;

  const months = years * 12;
  const monthlyRate = annualReturn / 12 / 100;
  const invested = monthlyInvestment * months;

  if (monthlyRate === 0) {
    return {
      invested: round2(invested),
      estimatedReturns: 0,
      maturityValue: round2(invested),
    };
  }

  const factor = Math.pow(1 + monthlyRate, months);
  const maturityValue = monthlyInvestment * ((factor - 1) / monthlyRate) * (1 + monthlyRate);
  return {
    invested: round2(invested),
    estimatedReturns: round2(maturityValue - invested),
    maturityValue: round2(maturityValue),
  };
}

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
