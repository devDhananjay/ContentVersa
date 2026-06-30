import { cn } from "@/lib/utils";

type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

/** Crawlable editorial copy for hub pages — helps AdSense / quality reviewers see real content. */
export function HubEditorialIntro({ title, children, className }: Props) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 bg-card/40 p-6 md:p-8 space-y-4",
        className
      )}
      aria-labelledby="hub-editorial-heading"
    >
      <h2
        id="hub-editorial-heading"
        className="font-display text-xl md:text-2xl font-bold tracking-tight"
      >
        {title}
      </h2>
      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}
