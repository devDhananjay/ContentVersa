import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  HUID_VERIFICATION_FAQ,
  HUID_VERIFICATION_PATH,
  HUID_VERIFICATION_STEPS,
} from "@/lib/goldverse/huid-seo";

export function HuidVerificationGuide() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border/60 bg-card/50 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
          How it works
        </p>
        <h2 className="mt-2 font-display text-xl font-bold md:text-2xl">
          How to verify HUID online in India
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground leading-relaxed">
          BIS-mandated HUID verification helps buyers confirm that gold jewellery is
          genuinely hallmarked. Use ContentVerse to check any 6-character Hallmark Unique
          ID against the official BIS records — see jeweller, purity, weight and marking
          date before you buy or sell.
        </p>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {HUID_VERIFICATION_STEPS.map((item) => (
            <li
              key={item.step}
              className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-300">
                {item.step}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/50 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
          HUID FAQ
        </p>
        <h2 className="mt-2 font-display text-xl font-bold">
          HUID verification — common questions
        </h2>
        <div className="mt-4 space-y-2">
          {HUID_VERIFICATION_FAQ.map((item) => (
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

      <p className="text-center text-sm text-muted-foreground">
        Also on{" "}
        <Link href="/goldverse" className="font-medium text-amber-400 hover:underline">
          GoldVerse
        </Link>
        : gold rates by city, fake gold checklist and BIS hallmark guide.{" "}
        <Link href={HUID_VERIFICATION_PATH} className="font-medium text-amber-400 hover:underline">
          HUID verification
        </Link>{" "}
        is free with 3 checks per account.
      </p>
    </div>
  );
}
