import { ChevronDown } from "lucide-react";

const GUIDE = [
  {
    q: "What is BIS Hallmark?",
    a: "Bureau of Indian Standards certifies gold jewellery purity (e.g. 22K916, 18K750). Only licensed jewellers and Assaying & Hallmarking Centres (AHC) can apply the mark.",
  },
  {
    q: "What is HUID?",
    a: "Hallmark Unique ID — a 6-character alphanumeric code laser-marked on each piece since 1 July 2021. It links to jeweller, purity, weight and marking date in the BIS database.",
  },
  {
    q: "Which marks should I see?",
    a: "BIS logo, purity/fineness (e.g. 22K916), Assaying Centre mark, jeweller's identification mark, and HUID. All six components on new jewellery.",
  },
  {
    q: "22K vs 18K — what's the difference?",
    a: "22K is ~91.6% gold (common in India for ornaments). 18K is 75% gold — harder, used in diamond jewellery. Price and resale value differ.",
  },
  {
    q: "Can I verify old jewellery without HUID?",
    a: "Pre-2021 pieces may not have HUID. Check invoice, jeweller licence, and consider XRF testing at an AHC for older items.",
  },
];

export function HallmarkGuide() {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/50 p-6 md:p-8">
      <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
        Hallmark guide
      </p>
      <h2 className="mt-2 font-display text-xl font-bold">BIS hallmark explained</h2>
      <div className="mt-4 space-y-2">
        {GUIDE.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-border/50 bg-muted/10 px-4 py-1 open:bg-muted/20"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
            </summary>
            <p className="pb-3 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
