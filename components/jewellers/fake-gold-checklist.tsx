import { AlertOctagon, Eye, Scale, Stamp } from "lucide-react";

const CHECKS = [
  {
    icon: Stamp,
    title: "Missing or unclear HUID",
    desc: "Every BIS hallmarked piece since 2021 must carry a 6-character HUID laser mark.",
  },
  {
    icon: Scale,
    title: "Weight mismatch",
    desc: "Weigh at home — if shop scale differs sharply, ask for re-weigh on certified scale.",
  },
  {
    icon: Eye,
    title: "Faded or scratched mark",
    desc: "Tampered laser marks, stickers over hallmark, or only 916 stamp without HUID are red flags.",
  },
  {
    icon: AlertOctagon,
    title: "No BIS record",
    desc: "Use our HUID verify tool — if BIS returns no record, do not buy at hallmark price.",
  },
];

export function FakeGoldChecklist() {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/50 p-6 md:p-8">
      <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
        Fake gold check
      </p>
      <h2 className="mt-2 font-display text-xl font-bold">Spot red flags before you buy</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Quick buyer checklist — always confirm with official HUID verification.
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {CHECKS.map(({ icon: Icon, title, desc }) => (
          <li
            key={title}
            className="flex gap-3 rounded-xl border border-border/50 bg-muted/20 p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold">{title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
