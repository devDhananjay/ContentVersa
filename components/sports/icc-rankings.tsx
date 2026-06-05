"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { PlayerRanking, RankingFormat } from "@/lib/sports/types";
import { playerFaceImageUrl } from "@/lib/sports/transformers";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IccRankingsProps {
  rankingsByFormat: Partial<Record<RankingFormat, PlayerRanking[]>>;
  defaultFormat?: RankingFormat;
}

const FORMATS: { value: RankingFormat; label: string }[] = [
  { value: "test", label: "Test" },
  { value: "odi", label: "ODI" },
  { value: "t20", label: "T20" },
];

export function IccRankings({
  rankingsByFormat,
  defaultFormat = "odi",
}: IccRankingsProps) {
  const [format, setFormat] = React.useState<RankingFormat>(defaultFormat);
  const rankings = rankingsByFormat[format] ?? [];

  const hasAny = FORMATS.some((f) => (rankingsByFormat[f.value]?.length ?? 0) > 0);
  if (!hasAny) return null;

  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="font-display font-bold mb-3">ICC Batsman Rankings</h3>
      <Tabs value={format} onValueChange={(v) => setFormat(v as RankingFormat)}>
        <TabsList className="w-full h-8 mb-3">
          {FORMATS.map((f) => (
            <TabsTrigger key={f.value} value={f.value} className="text-xs flex-1">
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <ul key={format}>
          {rankings.length === 0 ? (
            <li className="text-sm text-muted-foreground py-4 text-center">
              No rankings available.
            </li>
          ) : (
            rankings.slice(0, 8).map((p) => (
              <li key={`${format}-${p.id}`} className="mb-2 last:mb-0">
                <Link
                  href={`/sports/player/${p.id}`}
                  className="flex items-center gap-2.5 rounded-lg p-1.5 -mx-1.5 hover:bg-accent/50 transition-colors"
                >
                  <span className="w-5 text-xs font-bold text-muted-foreground text-center">
                    {p.rank}
                  </span>
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
                    {playerFaceImageUrl(p.faceImageId) ? (
                      <Image
                        src={playerFaceImageUrl(p.faceImageId)!}
                        alt={p.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[9px] font-bold">
                        {p.name.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.country}</p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-neon-cyan">
                    {p.rating}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </Tabs>
    </div>
  );
}
