"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Holiday = { date: string; name: string; englishName: string; source?: string };

export function IndianHolidaysTool() {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = React.useState(thisYear);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [holidays, setHolidays] = React.useState<Holiday[]>([]);

  async function load(y: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tools/holidays?year=${y}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setHolidays(json.holidays || []);
      setYear(y);
    } catch (err) {
      setHolidays([]);
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load(thisYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Public holidays in India</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={year === thisYear ? "default" : "outline"}
              onClick={() => void load(thisYear)}
              disabled={loading}
            >
              {thisYear}
            </Button>
            <Button
              type="button"
              variant={year === thisYear + 1 ? "default" : "outline"}
              onClick={() => void load(thisYear + 1)}
              disabled={loading}
            >
              {thisYear + 1}
            </Button>
            {loading ? <Loader2 className="h-4 w-4 animate-spin self-center" /> : null}
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <ul className="divide-y rounded-lg border">
            {holidays.map((h) => (
              <li key={`${h.date}-${h.name}`} className="flex flex-wrap justify-between gap-2 px-3 py-2 text-sm">
                <span className="font-medium">{h.name}</span>
                <span className="text-muted-foreground">{h.date}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Central Government gazetted holidays for 2026 are bundled locally, so this works even
            if the public holiday API is down. State holidays may differ.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
