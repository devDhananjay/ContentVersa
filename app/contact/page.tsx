import type { Metadata } from "next";
import { Mail, MessageSquare, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact us",
  description:
    "Get in touch with the ContentVerse team — partnerships, support, and creator enquiries.",
  path: "/contact",
});

const CONTACT_EMAIL = "writewith@contentveres.in";

export default function ContactPage() {
  return (
    <div className="container py-12 md:py-16 max-w-5xl">
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-neon-purple mb-2">
          Contact
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
          We&apos;d love to hear from you
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Whether you&apos;re a writer, reader, brand, or partner — reach out and our team will
          get back within 1–2 business days.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
        <ContactForm />

        <aside className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h2 className="font-display text-lg font-bold">Direct email</h2>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-3 text-sm hover:text-neon-purple transition-colors"
            >
              <Mail className="h-5 w-5 text-neon-cyan shrink-0" />
              <span className="break-all">{CONTACT_EMAIL}</span>
            </a>
            <p className="text-sm text-muted-foreground">
              For publishing enquiries, creator support, bugs, or partnerships — write to us
              anytime.
            </p>
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
