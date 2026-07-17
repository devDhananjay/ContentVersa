"use client";

import * as React from "react";
import { validateEpic } from "@/lib/tools/election";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ElectionInfoTool() {
  const [epic, setEpic] = React.useState("");
  const result = React.useMemo(() => (epic.trim() ? validateEpic(epic) : null), [epic]);

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Voter ID / EPIC format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="epic">EPIC number</Label>
            <Input
              id="epic"
              value={epic}
              onChange={(e) => setEpic(e.target.value.toUpperCase())}
              placeholder="ABC1234567"
              className="font-mono uppercase"
              maxLength={10}
            />
          </div>
          {result ? (
            <div
              className={`rounded-lg border p-3 text-sm ${
                result.valid
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-destructive/40 bg-destructive/5"
              }`}
            >
              {result.message}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Official Election Commission links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <a
              href="https://voters.eci.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              voters.eci.gov.in
            </a>{" "}
            — search / verify voter details
          </p>
          <p>
            <a
              href="https://www.eci.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              eci.gov.in
            </a>{" "}
            — Election Commission of India
          </p>
          <p>
            <a
              href="https://results.eci.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              results.eci.gov.in
            </a>{" "}
            — election results
          </p>
          <p className="text-xs text-muted-foreground pt-2">
            There is no free public Election Data API for citizen apps. Live voter status is only on
            official ECI portals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
