"use client";

import * as React from "react";
import { ExternalLink, TrainFront } from "lucide-react";
import {
  buildTrainStatusResult,
  isValidTrainNumber,
  trainStatusLinks,
} from "@/lib/tools/railway";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TrainRunningStatusTool() {
  const [train, setTrain] = React.useState("");
  const valid = isValidTrainNumber(train);
  const links = valid ? trainStatusLinks(train) : [];
  const result = valid ? buildTrainStatusResult(train) : null;

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
              onChange={(e) =>
                setTrain(e.target.value.replace(/\D/g, "").slice(0, 5))
              }
              placeholder="12951"
              className="font-mono text-lg tracking-widest"
            />
          </div>
          {valid ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="cta" asChild>
                <a
                  href={links[0]?.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open live status
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
              <Button type="button" variant="outline" asChild>
                <a
                  href={links[2]?.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NTES official
                </a>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter a 4–5 digit train number (e.g. 12951 for Mumbai Rajdhani).
            </p>
          )}
        </CardContent>
      </Card>

      {result?.ok ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Train {result.trainNumber} — status providers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Live delay/map data comes from railway enquiry partners. Pick one:
            </p>
            {result.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-3 py-2 font-medium text-primary hover:border-primary/40"
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
