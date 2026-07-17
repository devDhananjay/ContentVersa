"use client";

import * as React from "react";
import { calculateAge } from "@/lib/tools/age";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AgeCalculatorTool() {
  const today = new Date().toISOString().slice(0, 10);
  const [dob, setDob] = React.useState("2000-01-01");
  const [asOf, setAsOf] = React.useState(today);

  const result = React.useMemo(() => calculateAge(dob, asOf), [dob, asOf]);

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calculate age</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="dob">Date of birth</Label>
            <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="asof">As of</Label>
            <Input id="asof" type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      {result ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Result</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Age · </span>
              <strong>
                {result.years} years, {result.months} months, {result.days} days
              </strong>
            </p>
            <p>
              <span className="text-muted-foreground">Total days · </span>
              {result.totalDays.toLocaleString()}
            </p>
            <p className="sm:col-span-2">
              <span className="text-muted-foreground">Next birthday in · </span>
              {result.nextBirthdayInDays} days
            </p>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-destructive">Enter a valid date of birth on or before the as-of date.</p>
      )}
    </div>
  );
}
