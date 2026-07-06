import {
  SCREENSHOT_SCAN_OCR_FAQ,
  SCREENSHOT_SCAN_OCR_STEPS,
} from "@/lib/moneyverse/screenshot-scan-seo";

export function ScreenshotScanGuide() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section className="rounded-2xl border border-violet-500/20 bg-card/50 p-6">
        <h2 className="font-display text-lg font-bold">How OCR screenshot scan works</h2>
        <ol className="mt-4 space-y-4">
          {SCREENSHOT_SCAN_OCR_STEPS.map((item) => (
            <li key={item.step} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-300">
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
        <h2 className="font-display text-lg font-bold">Screenshot OCR — FAQ</h2>
        <dl className="mt-4 space-y-4">
          {SCREENSHOT_SCAN_OCR_FAQ.map((item) => (
            <div key={item.q}>
              <dt className="text-sm font-semibold">{item.q}</dt>
              <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
