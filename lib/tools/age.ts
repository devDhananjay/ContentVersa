export type AgeResult = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  nextBirthdayInDays: number;
};

export function calculateAge(dobIso: string, asOfIso = new Date().toISOString().slice(0, 10)): AgeResult | null {
  const dob = parseYmd(dobIso);
  const asOf = parseYmd(asOfIso);
  if (!dob || !asOf || asOf.getTime() < dob.getTime()) return null;

  let years = asOf.getFullYear() - dob.getFullYear();
  let months = asOf.getMonth() - dob.getMonth();
  let days = asOf.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor((asOf.getTime() - dob.getTime()) / 86_400_000);

  const next = new Date(asOf.getFullYear(), dob.getMonth(), dob.getDate());
  if (next.getTime() <= asOf.getTime()) {
    next.setFullYear(asOf.getFullYear() + 1);
  }
  const nextBirthdayInDays = Math.ceil((next.getTime() - asOf.getTime()) / 86_400_000);

  return { years, months, days, totalDays, nextBirthdayInDays };
}

function parseYmd(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}
