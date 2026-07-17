export type IndiaHoliday = {
  date: string;
  name: string;
  englishName: string;
  types: string[];
  source: "Central Government" | "Public API" | "Fallback";
};

const HOLIDAYS_2026: IndiaHoliday[] = [
  holiday("2026-01-26", "Republic Day"),
  holiday("2026-03-04", "Holi"),
  holiday("2026-03-21", "Id-ul-Fitr"),
  holiday("2026-03-26", "Ram Navami"),
  holiday("2026-03-31", "Mahavir Jayanti"),
  holiday("2026-04-03", "Good Friday"),
  holiday("2026-05-01", "Buddha Purnima"),
  holiday("2026-05-27", "Id-ul-Zuha (Bakrid)"),
  holiday("2026-06-26", "Muharram"),
  holiday("2026-08-15", "Independence Day"),
  holiday("2026-08-26", "Id-e-Milad"),
  holiday("2026-09-04", "Janmashtami"),
  holiday("2026-10-02", "Mahatma Gandhi's Birthday"),
  holiday("2026-10-20", "Dussehra"),
  holiday("2026-11-08", "Diwali (Deepavali)"),
  holiday("2026-11-24", "Guru Nanak's Birthday"),
  holiday("2026-12-25", "Christmas Day"),
];

const FIXED_NATIONAL_HOLIDAYS = [
  { month: "01", day: "26", name: "Republic Day" },
  { month: "08", day: "15", name: "Independence Day" },
  { month: "10", day: "02", name: "Mahatma Gandhi's Birthday" },
  { month: "12", day: "25", name: "Christmas Day" },
] as const;

export function fallbackIndiaHolidays(year: number): IndiaHoliday[] {
  if (year === 2026) return HOLIDAYS_2026;

  return FIXED_NATIONAL_HOLIDAYS.map((h) => ({
    date: `${year}-${h.month}-${h.day}`,
    name: h.name,
    englishName: h.name,
    types: ["National", "Gazetted"],
    source: "Fallback",
  }));
}

function holiday(date: string, name: string): IndiaHoliday {
  return {
    date,
    name,
    englishName: name,
    types: ["Gazetted"],
    source: "Central Government",
  };
}
