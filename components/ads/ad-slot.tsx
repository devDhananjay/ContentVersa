import { cn } from "@/lib/utils";

/**
 * Soft editorial wrapper — TOI-style compact MREC by default.
 * Caps height so AdSense creatives cannot inflate a giant empty band.
 */
export function AdSlot({
  children,
  className,
  label = "Advertisement",
  variant = "mrec",
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
  /** mrec = compact centered 300×250; band = wider strip */
  variant?: "mrec" | "band";
}) {
  const isMrec = variant === "mrec";

  return (
    <aside
      className={cn(
        "w-full",
        isMrec ? "my-4 py-2" : "my-6 border-y border-border/40 bg-muted/5 py-3 dark:bg-muted/10",
        className
      )}
      data-cv-ad-zone={isMrec ? "mrec" : "soft"}
      aria-label={label}
    >
      <p className="mb-1.5 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </p>
      <div
        className={cn(
          "mx-auto",
          isMrec
            ? "flex h-[250px] w-[300px] max-w-full items-center justify-center overflow-hidden"
            : "w-full max-w-3xl overflow-hidden"
        )}
      >
        {children}
      </div>
    </aside>
  );
}
