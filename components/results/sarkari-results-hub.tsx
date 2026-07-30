"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";
import {
  RESULT_BOARDS,
  RESULT_CATEGORIES,
  filterBoards,
  type ResultBoard,
} from "@/lib/results/boards";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SarkariResultsHub() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const boards = filterBoards(category, query);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SSC, CBSE, IBPS, NEET…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {RESULT_CATEGORIES.map((c) => (
          <Button
            key={c.id}
            type="button"
            size="sm"
            variant={category === c.id ? "default" : "outline"}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {boards.map((b) => (
          <BoardCard key={b.id} board={b} />
        ))}
      </div>

      {!boards.length ? (
        <p className="text-sm text-muted-foreground">
          No boards match your search. Try SSC, CBSE, or IBPS.
        </p>
      ) : null}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-base">Important</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            ContentVerse links only to <strong className="text-foreground">official</strong>{" "}
            result portals. We never publish fake roll numbers, marks, or paid
            “leaked” results.
          </p>
          <p>
            Looking for vacancies too? See{" "}
            <Link href="/jobs/govt" className="text-primary hover:underline">
              Sarkari Jobs
            </Link>
            .
          </p>
          <p className="text-xs">
            Showing {RESULT_BOARDS.length} curated boards on this hub.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function BoardCard({ board }: { board: ResultBoard }) {
  const href = board.resultUrl || board.officialUrl;
  return (
    <Card className="border-border/50 bg-card/60 transition hover:border-primary/40">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{board.name}</CardTitle>
          <Badge variant="secondary">{board.shortName}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{board.description}</p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Open official results
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </CardContent>
    </Card>
  );
}
