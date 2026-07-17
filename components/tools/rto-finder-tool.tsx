"use client";

import * as React from "react";
import { MapPin, Search } from "lucide-react";
import { searchRto } from "@/lib/tools/rto-codes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RtoFinderTool() {
  const [query, setQuery] = React.useState("");
  const results = React.useMemo(() => searchRto(query, 40), [query]);

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search any RTO in India</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="rto-q" className="sr-only">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="rto-q"
              className="pl-9"
              placeholder="e.g. Bareilly, UP25, Pune, MH12"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            1,200+ RTO / registering offices with address. Official services:{" "}
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

      <p className="text-xs text-muted-foreground">
        Showing {results.length} result{results.length === 1 ? "" : "s"}
        {query ? ` for “${query.trim()}”` : " (type to search all India)"}.
      </p>

      <div className="space-y-2">
        {results.map((r) => (
          <Card key={r.code}>
            <CardContent className="space-y-2 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-lg font-bold text-primary">{r.code}</p>
                <p className="text-xs text-muted-foreground">{r.state}</p>
              </div>
              <p className="text-sm font-medium">{r.city}</p>
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{r.address}</span>
              </p>
            </CardContent>
          </Card>
        ))}
        {query && results.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No RTO matches — try city name (Bareilly) or code (UP25).
          </p>
        ) : null}
      </div>
    </div>
  );
}
