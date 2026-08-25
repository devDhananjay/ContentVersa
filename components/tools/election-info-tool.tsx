"use client";

import * as React from "react";
import { ExternalLink, Vote } from "lucide-react";
import { INDIAN_STATES_AND_UTS, validateEpic } from "@/lib/tools/election";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ECI_SEARCH_URL = "https://electoralsearch.eci.gov.in/";
const VOTERS_PORTAL_URL = "https://voters.eci.gov.in/";
const ECI_HOME_URL = "https://www.eci.gov.in/";

/**
 * Format-check helper + official ECI links.
 * Live voter lookup stays on official ECI portals (CAPTCHA required).
 */
export function ElectionInfoTool() {
  const [epic, setEpic] = React.useState("");
  const [state, setState] = React.useState("");

  const formatCheck = React.useMemo(
    () => (epic.trim() ? validateEpic(epic) : null),
    [epic]
  );

  const stateName =
    INDIAN_STATES_AND_UTS.find(([code]) => code === state)?.[1] || state;

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Vote className="h-5 w-5 text-primary" aria-hidden />
            Free EPIC / Voter ID format check
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Validate your 10-character EPIC number and state, then finish the official
            electoral-roll search on the Election Commission of India website.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="epic">EPIC number (Voter ID)</Label>
            <Input
              id="epic"
              value={epic}
              onChange={(e) => setEpic(e.target.value.toUpperCase())}
              placeholder="e.g. ABC1234567"
              className="font-mono uppercase tracking-wide"
              maxLength={10}
              autoComplete="off"
              spellCheck={false}
              aria-describedby="epic-help"
            />
            <p id="epic-help" className="text-xs text-muted-foreground">
              Usual pattern: 3 letters + 7 digits. Spaces and hyphens are ignored.
            </p>
            {formatCheck ? (
              <p
                className={`text-xs ${
                  formatCheck.valid
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive"
                }`}
              >
                {formatCheck.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="state">State / Union Territory</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state or UT of enrolment" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES_AND_UTS.map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formatCheck?.valid && state ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm space-y-2">
              <p className="font-medium">Format looks valid — continue on ECI</p>
              <p className="text-muted-foreground">
                EPIC{" "}
                <span className="font-mono text-foreground">
                  {formatCheck.normalized}
                </span>{" "}
                · {stateName}. Open the official search, enter the same details, and
                complete CAPTCHA there.
              </p>
              <a
                href={ECI_SEARCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
              >
                Open electoralsearch.eci.gov.in
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick tips before you search</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>Use the state printed on your EPIC, not only your current city.</li>
            <li>Watch letter O vs digit 0 when typing from a faded card.</li>
            <li>
              Forgot EPIC? Use “Search by Details” on ECI or the Voter Helpline app.
            </li>
            <li>Official helpline: 1950 (add your STD code when dialling).</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Official Election Commission links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <a
              href={ECI_SEARCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              electoralsearch.eci.gov.in
            </a>{" "}
            — search electoral roll by EPIC or details
          </p>
          <p>
            <a
              href={VOTERS_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              voters.eci.gov.in
            </a>{" "}
            — forms, e-EPIC, application status
          </p>
          <p>
            <a
              href={ECI_HOME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              eci.gov.in
            </a>{" "}
            — Election Commission of India
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
