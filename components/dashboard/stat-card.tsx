"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  icon,
  color = "from-neon-blue to-neon-purple",
  index = 0,
}: {
  label: string;
  value: string;
  delta?: number | null;
  icon: React.ReactNode;
  color?: string;
  index?: number;
}) {
  const showDelta = delta != null;
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="relative p-5 rounded-2xl border bg-card overflow-hidden group hover:shadow-neon transition-all"
    >
      <div className={cn("absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-20 group-hover:opacity-40 transition-opacity blur-2xl", color)} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white", color)}>
            {icon}
          </div>
          {showDelta ? (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                positive ? "text-green-500" : "text-red-500"
              )}
            >
              {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(delta ?? 0)}%
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground">Live</span>
          )}
        </div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4">
          {label}
        </p>
        <p className="font-display text-3xl font-extrabold mt-1">{value}</p>
      </div>
    </motion.div>
  );
}
