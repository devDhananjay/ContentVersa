import Link from "next/link";
import type { SitePageData } from "@/lib/data/site-pages";
import { CONTACT_EMAIL } from "@/lib/site-contact";

export function SitePageRenderer({ page }: { page: SitePageData }) {
  return (
    <div className="container py-12 md:py-16 max-w-4xl">
      <header className="mb-12">
        {page.badge && (
          <p className="text-sm font-semibold uppercase tracking-widest text-neon-purple mb-2">
            {page.badge}
          </p>
        )}
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
          {page.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{page.subtitle}</p>
        {page.updatedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            Updated {new Date(page.updatedAt).toLocaleDateString("en-IN")}
          </p>
        )}
      </header>

      <div className="space-y-10">
        {page.sections.map((section, i) => (
          <section key={i} className="space-y-4">
            {section.heading && (
              <h2 className="font-display text-2xl font-bold">{section.heading}</h2>
            )}
            {section.paragraphs?.map((p, j) => (
              <p key={j} className="text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 && (
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                {section.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            )}
            {section.cards && section.cards.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.cards.map((card, j) => (
                  <div key={j} className="rounded-2xl border bg-card p-5">
                    <h3 className="font-semibold">{card.title}</h3>
                    {card.meta && (
                      <p className="text-xs text-neon-purple mt-1 uppercase tracking-wider">
                        {card.meta}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">{card.description}</p>
                  </div>
                ))}
              </div>
            )}
            {section.callout && (
              <div className="rounded-2xl border border-neon-purple/30 bg-neon-purple/5 px-5 py-4 text-sm">
                {section.callout.includes(CONTACT_EMAIL) ? (
                  <p>
                    {section.callout.split(CONTACT_EMAIL)[0]}
                    <Link
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {CONTACT_EMAIL}
                    </Link>
                    {section.callout.split(CONTACT_EMAIL)[1]}
                  </p>
                ) : (
                  <p>{section.callout}</p>
                )}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
