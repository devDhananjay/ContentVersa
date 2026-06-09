import { cn } from "@/lib/utils";

/** Soft gradient + grid used on home hero — reuse above reels for one continuous look. */
export function AmbientPageBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 -z-10 pointer-events-none", className)}
      aria-hidden
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1200px,100vw)] h-[min(900px,120vh)] bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-pink/20 blur-3xl opacity-50 rounded-full" />
      <div className="absolute top-24 left-[8%] w-72 h-72 bg-neon-purple/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute top-12 right-[8%] w-72 h-72 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute inset-0 grid-noise opacity-30" />
    </div>
  );
}
