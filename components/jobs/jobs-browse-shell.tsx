import Image from "next/image";
import { ArrowRight, Building2, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobsNav } from "@/components/jobs/jobs-nav";
import { PageBack } from "@/components/site/page-back";
import { LocaleLink } from "@/components/i18n/locale-link";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { getRequestLocale } from "@/lib/i18n/locale-server";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1600";

export async function JobsBrowseShell({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <div>
      <section className="relative h-[220px] md:h-[260px] overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt={t(dict, "hubs.jobsTitle")}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-orange-500/5 to-neon-purple/10 mix-blend-overlay" />
        <div className="container relative h-full flex flex-col justify-end pb-8">
          <PageBack href="/" label={t(dict, "common.home")} tone="onDark" className="mb-3" />
          <Badge variant="gradient" className="w-fit mb-2 text-xs">
            {t(dict, "hubs.jobsBadge")}
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            {t(dict, "hubs.jobsTitle")}
          </h1>
          <p className="mt-1.5 text-sm text-foreground/75 max-w-xl">
            {t(dict, "hubs.jobsSub")}
          </p>
        </div>
      </section>

      <div className="container py-8 lg:py-10">
        <div className="space-y-8">
          <JobsNav />
          {children}
        </div>
      </div>
    </div>
  );
}

export async function JobsHubCards() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <LocaleLink
        href="/jobs/govt"
        className="group rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 hover:border-amber-500/50 transition-colors"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mb-4">
          <Landmark className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="font-display text-xl font-bold">{t(dict, "hubs.jobsGovtTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {t(dict, "hubs.jobsGovtDesc")}
        </p>
        <Button variant="link" className="px-0 mt-3 gap-1 text-amber-600 dark:text-amber-400">
          {t(dict, "hubs.jobsGovtCta")}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </LocaleLink>

      <LocaleLink
        href="/jobs/private"
        className="group rounded-2xl border border-neon-purple/25 bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 p-6 hover:border-neon-purple/50 transition-colors"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon-purple/15 text-neon-purple mb-4">
          <Building2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="font-display text-xl font-bold">{t(dict, "hubs.jobsPrivateTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {t(dict, "hubs.jobsPrivateDesc")}
        </p>
        <Button variant="link" className="px-0 mt-3 gap-1">
          {t(dict, "hubs.jobsPrivateCta")}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </LocaleLink>
    </div>
  );
}
