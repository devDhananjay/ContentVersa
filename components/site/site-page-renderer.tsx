import Link from "next/link";
import type { SitePageData } from "@/lib/data/site-pages";
import { CONTACT_EMAIL, normalizeContactEmail } from "@/lib/site-contact";
import { formatAdminDate } from "@/lib/admin/list-filters";
import { ArrowRight, Mail } from "lucide-react";

function TextWithEmail({ text }: { text: string }) {
  const normalized = normalizeContactEmail(text);
  if (!normalized.includes(CONTACT_EMAIL)) {
    return <>{normalized}</>;
  }
  const parts = normalized.split(CONTACT_EMAIL);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 ? (
            <Link
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-neon-purple hover:underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </Link>
          ) : null}
        </span>
      ))}
    </>
  );
}

const RELATED_LINKS: { href: string; label: string }[] = [
  { href: "/about", label: "About" },
  { href: "/creator-program", label: "Creator Program" },
  { href: "/careers", label: "Careers" },
  { href: "/press", label: "Press" },
  { href: "/policy", label: "Content Policy" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/contact", label: "Contact" },
];

export function SitePageRenderer({ page }: { page: SitePageData }) {
  const related = RELATED_LINKS.filter((l) => l.href !== `/${page.slug}`);

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-neon-purple/10 via-neon-blue/5 to-transparent pointer-events-none" />

      <div className="container relative py-12 md:py-16 max-w-4xl">
        <header className="mb-10 md:mb-14">
          {page.badge ? (
            <p className="inline-flex items-center rounded-full border border-neon-purple/30 bg-neon-purple/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-neon-purple mb-4">
              {page.badge}
            </p>
          ) : null}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            {page.title}
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            {page.subtitle}
          </p>
          {page.updatedAt ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Last updated {formatAdminDate(page.updatedAt)} IST
            </p>
          ) : null}
        </header>

        <div className="space-y-8">
          {page.sections.map((section, i) => (
            <section
              key={i}
              className="rounded-3xl border bg-card/80 backdrop-blur-sm p-6 md:p-8 shadow-sm"
            >
              {section.heading ? (
                <div className="flex items-start gap-3 mb-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neon-purple/10 text-xs font-bold text-neon-purple">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight pt-0.5">
                    {section.heading}
                  </h2>
                </div>
              ) : null}

              {section.paragraphs?.map((p, j) => (
                <p
                  key={j}
                  className="text-muted-foreground leading-relaxed mb-4 last:mb-0"
                >
                  <TextWithEmail text={p} />
                </p>
              ))}

              {section.bullets && section.bullets.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {section.bullets.map((b, j) => (
                    <li
                      key={j}
                      className="flex gap-3 text-muted-foreground leading-relaxed"
                    >
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neon-purple"
                        aria-hidden
                      />
                      <span>
                        <TextWithEmail text={b} />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.cards && section.cards.length > 0 ? (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.cards.map((card, j) => (
                    <div
                      key={j}
                      className="group rounded-2xl border bg-background/60 p-5 hover:border-neon-purple/40 transition-colors"
                    >
                      {card.meta ? (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neon-purple mb-2">
                          {card.meta}
                        </p>
                      ) : null}
                      <h3 className="font-semibold text-foreground group-hover:text-neon-purple transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        <TextWithEmail text={card.description} />
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              {section.callout ? (
                <div className="mt-5 flex gap-3 rounded-2xl border border-neon-purple/30 bg-gradient-to-r from-neon-purple/10 to-neon-blue/5 px-5 py-4 text-sm">
                  <Mail className="h-5 w-5 text-neon-purple shrink-0 mt-0.5" aria-hidden />
                  <p className="text-foreground/90 leading-relaxed">
                    <TextWithEmail text={section.callout} />
                  </p>
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <nav
          aria-label="Related pages"
          className="mt-12 rounded-3xl border bg-card p-6 md:p-8"
        >
          <h2 className="font-display text-lg font-bold mb-4">Explore more</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3.5 py-1.5 text-sm font-medium hover:border-neon-purple/40 hover:text-neon-purple transition-colors"
              >
                {link.label}
                <ArrowRight className="h-3.5 w-3.5 opacity-60" />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
