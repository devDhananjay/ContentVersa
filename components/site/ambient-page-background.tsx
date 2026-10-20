import { cn } from "@/lib/utils";

/** Home hero atmosphere — soft mesh, dots, grain. */
export function AmbientPageBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 -z-10 pointer-events-none overflow-hidden", className)}
      aria-hidden
    >
      <div className="v2-aurora v2-aurora-live" />
      <div className="hero-orb hero-orb-a opacity-40 dark:opacity-55" />
      <div className="hero-orb hero-orb-b opacity-35 dark:opacity-50" />
      <div className="absolute inset-0 opacity-[0.45] dark:opacity-35 [mask-image:radial-gradient(68%_52%_at_50%_18%,#000,transparent)]">
        <div className="v2-dots absolute inset-0" />
      </div>
      <div className="hero-grain absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" />
      {/* Soft vignette so content column reads cleaner */}
      <div className="absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_28%,transparent_35%,hsl(var(--background)/0.55)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/75 to-transparent" />
    </div>
  );
}
