import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PrivateJob } from "@/lib/jobs/types";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<PrivateJob["type"], string> = {
  "Full-time": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "Part-time": "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  Internship: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  Contract: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  Remote: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export function PrivateJobCard({ job, className }: { job: PrivateJob; className?: string }) {
  const isInternal = job.applyUrl.startsWith("/");

  return (
    <article
      className={cn(
        "rounded-2xl border border-border/60 bg-card/50 p-4 md:p-5 hover:border-neon-purple/30 hover:bg-neon-purple/5 transition-colors",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 text-sm font-bold"
          aria-hidden="true"
        >
          {job.company.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="outline" className={cn("text-[10px]", TYPE_STYLES[job.type])}>
              {job.type}
            </Badge>
            <span className="text-[11px] text-muted-foreground">{job.posted}</span>
          </div>
          <h3 className="font-semibold text-sm md:text-base leading-snug">{job.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{job.company}</p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {job.location}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs md:text-sm">
              <span className="text-muted-foreground">Salary · </span>
              <span className="font-medium">{job.salary}</span>
              <span className="text-muted-foreground"> · {job.experience}</span>
            </div>
            <Button asChild size="sm" variant="gradient" className="gap-1.5 shrink-0">
              {isInternal ? (
                <Link href={job.applyUrl}>
                  Apply
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              ) : (
                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                  Apply
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
