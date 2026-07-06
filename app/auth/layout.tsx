import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/site/logo";
import { buildMetadata } from "@/lib/seo";
import { getSiteLogoUrl } from "@/lib/branding/site-logo";
import { getPlatformStats, platformStatItems } from "@/lib/data/platform-stats";

export const metadata: Metadata = buildMetadata({
  title: "Sign in",
  description: "Sign in to your ContentVerse account.",
  noIndex: true,
});

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const [logoSrc, stats] = await Promise.all([getSiteLogoUrl(), getPlatformStats()]);
  const statRows = platformStatItems(stats);

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="relative hidden lg:flex items-end p-12 bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-pink/20 overflow-hidden">
        <div className="absolute inset-0 grid-noise opacity-30" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-neon-purple/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-neon-blue/30 rounded-full blur-3xl" />
        <div className="relative max-w-md">
          <Logo src={logoSrc} size="lg" />
          <h2 className="font-display text-4xl font-extrabold tracking-tight mt-10 leading-tight">
            Join the next generation of <span className="text-gradient">creators.</span>
          </h2>
          <p className="text-muted-foreground mt-4">
            ContentVerse pays creators in rupees. Real audience, real ownership — no algorithm cult required.
          </p>
          {statRows.length > 0 && (
            <div className="mt-8 grid grid-cols-3 gap-6">
              {statRows.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-display font-extrabold text-gradient">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="lg:hidden p-6">
          <Logo src={logoSrc} />
        </div>
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <div className="p-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}
