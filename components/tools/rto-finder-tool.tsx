"use client";

import * as React from "react";
import { searchRto } from "@/lib/tools/rto-codes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RtoFinderTool() {
  const [query, setQuery] = React.useState("");
  const results = React.useMemo(() => searchRto(query, 30), [query]);

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search RTO by city or code</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="rto-q" className="sr-only">
            Search
          </Label>
          <Input
            id="rto-q"
            placeholder="e.g. Pune, MH12, Delhi"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Reference list of major RTO offices. For full details visit{" "}
            <a
              href="https://parivahan.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              parivahan.gov.in
            </a>
            .
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {results.map((r) => (
          <Card key={r.code}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-mono font-bold text-primary">{r.code}</p>
                <p className="text-sm font-medium">{r.city}</p>
                <p className="text-xs text-muted-foreground">{r.state}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {query && results.length === 0 ? (
          <p className="text-sm text-muted-foreground">No RTO matches — try another city or code.</p>
        ) : null}
      </div>
    </div>
  );
}
