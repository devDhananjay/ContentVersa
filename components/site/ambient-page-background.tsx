import { cn } from "@/lib/utils";

/** Theme-aware aurora + dot grid used on the home hero (light = paper, dark = ink). */
export function AmbientPageBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 -z-10 pointer-events-none", className)}
      aria-hidden
    >
      <div className="v2-aurora" />
      <div className="v2-dots absolute inset-0 opacity-70 [mask-image:radial-gradient(75%_60%_at_50%_25%,#000,transparent)]" />
    </div>
  );
}
