import { cn } from "@/lib/utils";

export function JobsSectionHeader({
  eyebrow,
  title,
  highlight,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-5", className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
        {eyebrow}
      </p>
      <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
        {title}
        {highlight ? (
          <>
            {" "}
            <span className="gradient-text">{highlight}</span>
          </>
        ) : null}
      </h2>
      {description ? (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">{description}</p>
      ) : null}
    </div>
  );
}
