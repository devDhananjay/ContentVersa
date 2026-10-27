import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, MapPin, Clock, Phone, Megaphone } from "lucide-react";
import { DisableAutoAds } from "@/components/ads/disable-auto-ads";
import { ContactForm } from "@/components/site/contact-form";
import { PageBack } from "@/components/site/page-back";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
} from "@/lib/site-contact";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";

export const metadata: Metadata = buildMetadata({
  title: "Contact us",
  description:
    "Get in touch with the ContentVerse India team — partnerships, support, and creator enquiries.",
  path: "/contact",
});

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <div className="container py-12 md:py-16 max-w-5xl">
      <DisableAutoAds />
      <PageBack href="/" label={t(dict, "common.home")} className="mb-6" />
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-neon-purple mb-2">
          {t(dict, "hubs.contactEyebrow")}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
          {t(dict, "hubs.contactHeading")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t(dict, "hubs.contactBody")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
        <ContactForm />

        <aside className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h2 className="font-display text-lg font-bold">
              {t(dict, "hubs.contactGetInTouch")}
            </h2>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-3 text-sm hover:text-neon-purple transition-colors"
            >
              <Mail className="h-5 w-5 text-neon-cyan shrink-0" />
              <span className="break-all">{CONTACT_EMAIL}</span>
            </a>
            <a
              href={`tel:${CONTACT_PHONE}`}
              className="flex items-center gap-3 text-sm hover:text-neon-purple transition-colors"
            >
              <Phone className="h-5 w-5 text-neon-purple shrink-0" />
              <span>{CONTACT_PHONE_DISPLAY}</span>
            </a>
            <p className="text-sm text-muted-foreground">
              For publishing enquiries, creator support, bugs, or partnerships — write or call us
              anytime.
            </p>
          </div>

          <div className="rounded-2xl border border-neon-purple/25 bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 p-6 space-y-3">
            <div className="flex items-start gap-3">
              <Megaphone className="h-5 w-5 text-neon-purple shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{t(dict, "hubs.contactAdsCta")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Brands and agencies can request display, sponsored stories, or hub sponsorships.
                </p>
                <Link href="/advertise" className="mt-3 inline-block">
                  <Button size="sm" variant="gradient">
                    {t(dict, "hubs.contactAdsLink")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-neon-purple shrink-0 mt-0.5" />
              <p>
                <span className="font-medium text-foreground">Creators:</span> questions about
                publishing, moderation, or monetization.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-neon-blue shrink-0 mt-0.5" />
              <p>
                <span className="font-medium text-foreground">Based in India</span> — building for
                readers and writers across the web.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-neon-orange shrink-0 mt-0.5" />
              <p>
                <span className="font-medium text-foreground">Response time:</span> usually within
                48 hours on business days.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
