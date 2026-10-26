"use client";

import Image from "next/image";
import { BookOpen, FileSearch, ScanLine, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageBack } from "@/components/site/page-back";
import { LocaleLink } from "@/components/i18n/locale-link";
import { useDictionary } from "@/components/i18n/use-dictionary";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1600";

const TABS = [
  { href: "/moneyverse", labelKey: "hubs.moneyTabExpenses", fallback: "Expenses", icon: Wallet },
  {
    href: "/moneyverse/screenshot-scan",
    labelKey: "hubs.moneyTabScan",
    fallback: "Screenshot Scan",
    icon: ScanLine,
  },
  {
    href: "/moneyverse/bank-statement-analyzer",
    labelKey: "hubs.moneyTabBank",
    fallback: "Bank Statement Analyzer",
    icon: FileSearch,
  },
  {
    href: "/finance#money-guides",
    labelKey: "hubs.moneyTabGuides",
    fallback: "Money Guides",
    icon: BookOpen,
  },
] as const;

export function MoneyVerseBrowseShell({ children }: { children: React.ReactNode }) {
  const { t } = useDictionary();

  return (
    <div>
      <section className="relative mx-0 h-[210px] overflow-hidden rounded-b-2xl md:h-[240px]">
        <Image
          src={HERO_IMAGE}
          alt={t("hubs.moneyTitle")}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-background/90 to-background/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(52,211,153,0.12),transparent_55%)]" />
        <div className="container relative flex h-full flex-col justify-end pb-6">
          <PageBack href="/" label={t("common.home")} tone="onDark" className="mb-3" />
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
            {t("hubs.moneySub")}
          </p>
        </div>
      </section>

      <div className="container pt-4">
        <nav className="flex flex-wrap gap-2 border-b border-border/50 pb-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <LocaleLink
                key={tab.href}
                href={tab.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10"
              >
                <Icon className="h-3.5 w-3.5" />
                {t(tab.labelKey, tab.fallback)}
              </LocaleLink>
            );
          })}
        </nav>
      </div>

      <div className="container py-6">{children}</div>
    </div>
  );
}
