"use client";

import * as React from "react";
import { ExternalLink, TrainFront } from "lucide-react";
import {
  buildTrainStatusResult,
  isValidTrainNumber,
} from "@/lib/tools/railway";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TrainRunningStatusTool() {
  const [train, setTrain] = React.useState("");
  const [checked, setChecked] = React.useState(false);

  const result = checked ? buildTrainStatusResult(train) : null;

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrainFront className="h-5 w-5" />
            Live train running status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="train">Train number</Label>
            <Input
              id="train"
              inputMode="numeric"
              maxLength={5}
              value={train}
              onChange={(e) => {
                setTrain(e.target.value.replace(/\D/g, "").slice(0, 5));
                setChecked(false);
              }}
              placeholder="12951"
              className="font-mono text-lg tracking-widest"
            />
          </div>
          <Button
            onClick={() => setChecked(true)}
            disabled={!isValidTrainNumber(train)}
          >
            Get running status links
          </Button>
          {result && !result.ok ? (
            <p className="text-sm text-destructive">{result.message}</p>
          ) : null}
        </CardContent>
      </Card>

      {result?.ok ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Train {result.trainNumber} — live status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">{result.message}</p>
            {result.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {l.label}
              </a>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
