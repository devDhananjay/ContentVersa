"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PrivateJobCard } from "@/components/jobs/private-job-card";
import type { PrivateJob } from "@/lib/jobs/types";
import { cn } from "@/lib/utils";

const FILTERS: Array<PrivateJob["type"] | "all"> = [
  "all",
  "Full-time",
  "Remote",
  "Internship",
  "Contract",
  "Part-time",
];

export function PrivateJobsBoard({ jobs }: { jobs: PrivateJob[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof FILTERS)[number]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesType = type === "all" || job.type === type;
      if (!matchesType) return false;
      if (!q) return true;
      return (
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.skills.some((skill) => skill.toLowerCase().includes(q))
      );
    });
  }, [jobs, query, type]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search role, company, or skill…"
            className="pl-9"
            aria-label="Search private jobs"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setType(filter)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                type === filter
                  ? "border-neon-purple/40 bg-neon-purple/10 text-foreground"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {filter === "all" ? "All" : filter}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{filtered.length}</span> openings
      </p>

      <div className="grid gap-4">
        {filtered.map((job) => (
          <PrivateJobCard key={job.id} job={job} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          No jobs match your filters. Try a different search or category.
        </div>
      )}
    </div>
  );
}
