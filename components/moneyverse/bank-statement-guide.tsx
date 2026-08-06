import {
  BANK_STATEMENT_FAQ,
  BANK_STATEMENT_STEPS,
} from "@/lib/moneyverse/bank-statement-seo";

export function BankStatementGuide() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section className="rounded-2xl border border-emerald-500/20 bg-card/50 p-6">
        <h2 className="font-display text-lg font-bold">
          How bank statement analysis works
        </h2>
        <ol className="mt-4 space-y-4">
          {BANK_STATEMENT_STEPS.map((item) => (
            <li key={item.step} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                {item.step}
              </span>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/50 p-6">
        <h2 className="font-display text-lg font-bold">Bank statement — FAQ</h2>
        <dl className="mt-4 space-y-4">
          {BANK_STATEMENT_FAQ.map((item) => (
            <div key={item.q}>
              <dt className="text-sm font-semibold">{item.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
