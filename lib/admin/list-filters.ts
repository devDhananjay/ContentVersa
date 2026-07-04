export type DateField = "createdAt" | "publishedAt" | "updatedAt";

export type SortDir = "asc" | "desc";

export function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function endOfDay(value: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function inDateRange(
  value: Date | string | null | undefined,
  from: string,
  to: string
): boolean {
  if (!from && !to) return true;
  if (!value) return false;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  const start = parseDateInput(from);
  const end = endOfDay(to);
  if (start && d < start) return false;
  if (end && d > end) return false;
  return true;
}

export function matchesSearch(
  q: string,
  ...fields: (string | null | undefined)[]
): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((f) => f?.toLowerCase().includes(needle));
}

/** Always Asia/Kolkata — EC2 runs UTC so bare toLocaleString() is ~5.5h behind IST. */
export function formatAdminDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(d);
}
