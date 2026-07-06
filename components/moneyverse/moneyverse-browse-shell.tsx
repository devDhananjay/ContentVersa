import Image from "next/image";
import { Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1600";

export function MoneyVerseBrowseShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <section className="relative mx-0 h-[210px] overflow-hidden rounded-b-2xl md:h-[240px]">
        <Image
          src={HERO_IMAGE}
          alt="MoneyVerse — expense tracker India"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-background/90 to-background/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(52,211,153,0.12),transparent_55%)]" />
        <div className="container relative flex h-full flex-col justify-end pb-6">
          <Badge
            variant="outline"
            className="mb-2 h-5 w-fit gap-1 border-emerald-500/40 text-[10px] text-emerald-200"
          >
            <Wallet className="h-2.5 w-2.5" /> UPI · India
          </Badge>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-4xl">
            Money<span className="text-emerald-400">Verse</span>
          </h1>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground md:text-sm">
            Track expenses, plan budgets, monthly reports &{" "}
            <span className="text-violet-300">Screenshot Scan (OCR)</span> for UPI payments
          </p>
        </div>
      </section>
      <div className="container py-6">{children}</div>
    </div>
  );
}
