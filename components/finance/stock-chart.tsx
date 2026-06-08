"use client";

import type { StockChartPoint } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

interface StockChartProps {
  data: StockChartPoint[];
  className?: string;
}

export function StockChart({ data, className }: StockChartProps) {
  if (data.length < 2) {
    return (
      <div className={cn("flex items-center justify-center h-48 text-sm text-muted-foreground", className)}>
        Chart data unavailable
      </div>
    );
  }

  const closes = data.map((d) => d.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const w = 100;
  const h = 40;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d.close - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  const up = closes[closes.length - 1] >= closes[0];

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="w-full h-48"
      >
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={up ? "rgb(16,185,129)" : "rgb(239,68,68)"}
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor={up ? "rgb(16,185,129)" : "rgb(239,68,68)"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${h} ${points} ${w},${h}`}
          fill="url(#chartGrad)"
        />
        <polyline
          points={points}
          fill="none"
          stroke={up ? "rgb(16,185,129)" : "rgb(239,68,68)"}
          strokeWidth="0.8"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
        <span>{data[0]?.date}</span>
        <span>3M</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
