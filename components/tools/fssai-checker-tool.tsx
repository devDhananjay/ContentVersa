"use client";

import * as React from "react";
import { validateFssai } from "@/lib/tools/fssai";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FssaiCheckerTool() {
  const [value, setValue] = React.useState("");
  const result = React.useMemo(() => (value.trim() ? validateFssai(value) : null), [value]);

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">FSSAI license format check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="fssai">14-digit FSSAI number</Label>
            <Input
              id="fssai"
              inputMode="numeric"
              maxLength={14}
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 14))}
              placeholder="10012011000168"
              className="font-mono"
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
              <p className="font-medium">{result.message}</p>
              {result.kind ? (
                <p className="mt-1 text-muted-foreground">Likely type: {result.kind}</p>
              ) : null}
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Format check only. For live status use{" "}
            <a
              href="https://foscos.fssai.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              FoSCoS (foscos.fssai.gov.in)
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
