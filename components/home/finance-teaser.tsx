import { ArrowRight, TrendingUp, Wallet, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LocaleLink } from "@/components/i18n/locale-link";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import type { FinanceTickerData } from "@/lib/finance/types";
import { TOOL_REGISTRY } from "@/lib/tools/registry";

interface FinanceTeaserProps {
  data: FinanceTickerData | null;
}

function formatSignedPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function IndexTile({
  name,
  price,
  changePercent,
}: {
  name: string;
  price: number;
  changePercent: number;
}) {
  const up = changePercent >= 0;
  return (
    <div
      className={`v2-raised overflow-hidden rounded-3xl p-5 ${
        up
          ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-card"
          : "border-red-500/20 bg-gradient-to-br from-red-500/10 to-card"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{name}</p>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight">
        {price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
      </p>
      <p
        className={`mt-1.5 text-sm font-semibold tabular-nums ${
          up ? "text-[hsl(var(--positive))]" : "text-[hsl(var(--negative))]"
        }`}
      >
        {formatSignedPercent(changePercent)}
      </p>
    </div>
  );
}

export async function FinanceTeaser({ data }: FinanceTeaserProps) {
  if (!data) return null;

  const gainers = data.topGainers.slice(0, 3);
  const toolsCount = TOOL_REGISTRY.length;
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <section className="container py-12 md:py-16" id="home-finance">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <Badge variant="neon" className="mb-2 gap-1">
            <TrendingUp className="h-3 w-3" /> {t(dict, "home.financeBadge")}
          </Badge>
          <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            {t(dict, "home.financeTitle")}{" "}
            <span className="text-gradient">{t(dict, "home.financeTitleAccent")}</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(dict, "home.financeSub")}
          </p>
        </div>
        <LocaleLink href="/finance" className="hidden md:block">
          <Button variant="outline" className="gap-2">
            {t(dict, "home.financeCta")} <ArrowRight className="h-4 w-4" />
          </Button>
        </LocaleLink>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            <IndexTile
              name={data.nifty.name}
              price={data.nifty.price}
              changePercent={data.nifty.changePercent}
            />
            <IndexTile
              name={data.sensex.name}
              price={data.sensex.price}
              changePercent={data.sensex.changePercent}
            />
            {gainers.length ? (
              <div className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:col-span-2">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t(dict, "home.topMovers")}
                </p>
                <ul className="grid gap-2 sm:grid-cols-3">
                  {gainers.map((stock) => (
                    <li
                      key={stock.symbol}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-background/40 px-3 py-2 text-sm"
                    >
                      <span className="truncate font-semibold">{stock.symbol}</span>
                      <span
                        className={`shrink-0 tabular-nums font-semibold ${
                          stock.changePercent >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {formatSignedPercent(stock.changePercent)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3">
            <LocaleLink
              href="/moneyverse"
              className="flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 transition hover:bg-emerald-500/15"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <Wallet className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display font-bold">
                  {t(dict, "home.modMoneyverseName")}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {t(dict, "home.modMoneyverseDesc")}
                </span>
              </span>
            </LocaleLink>
            <LocaleLink
              href="/tools"
              className="flex items-start gap-3 rounded-2xl border border-teal-500/25 bg-teal-500/10 p-4 transition hover:bg-teal-500/15"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                <Wrench className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display font-bold">
                  {t(dict, "home.modToolsName")}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {t(dict, "home.modToolsBadge").replace("{n}", String(toolsCount))}
                </span>
              </span>
            </LocaleLink>
          </div>
        </div>

      </div>

      <div className="mt-6 md:hidden">
        <LocaleLink href="/finance">
          <Button variant="gradient" className="w-full gap-2">
            {t(dict, "home.financeCta")} <ArrowRight className="h-4 w-4" />
          </Button>
        </LocaleLink>
      </div>
    </section>
  );
}
