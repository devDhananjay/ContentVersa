import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/auth/use-session";
import { BookmarkStatusProvider } from "@/components/blog/bookmark-status-provider";
import { SiteHeader } from "@/components/site/site-header";
import { Footer } from "@/components/site/footer";
import { MobileNav } from "@/components/site/mobile-nav";
import { AppEffects } from "@/components/app-effects";
import { SkipToMainLink } from "@/components/a11y/skip-to-main-link";
import { Toaster } from "sonner";
import { buildMetadata } from "@/lib/seo";
import { BrandingHead } from "@/components/site/branding-head";
import { AdSenseSiteScript } from "@/components/ads/adsense-site-script";
import { GoogleAdsTag } from "@/components/ads/google-ads-tag";

/** Body / UI — Fontshare Satoshi (self-hosted). */
const satoshi = localFont({
  src: [
    { path: "./fonts/satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/satoshi-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

/**
 * Headings — Source Serif 4 (Medium-style editorial serif).
 * Lighter than Clash Display at large sizes; pairs with Satoshi body.
 */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({});
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <BrandingHead />
        <GoogleAdsTag />
        <AdSenseSiteScript />
      </head>
      <body
        className={`${satoshi.variable} ${sourceSerif.variable} ${mono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
          <BookmarkStatusProvider>
          <SkipToMainLink />
          <div id="site-content" className="flex flex-1 flex-col min-h-0">
            <SiteHeader />
            <main
              id="main-content"
              tabIndex={-1}
              className="flex-1 pt-[var(--site-header-offset)] pb-24 md:pb-8 outline-none"
            >
              {children}
            </main>
            <Footer />
            <MobileNav />
          </div>
          <AppEffects />
          <Toaster richColors position="top-center" closeButton />
          </BookmarkStatusProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
