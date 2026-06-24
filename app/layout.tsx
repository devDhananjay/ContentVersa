import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site/site-header";
import { Footer } from "@/components/site/footer";
import { MobileNav } from "@/components/site/mobile-nav";
import { AppEffects } from "@/components/app-effects";
import { SkipToMainLink } from "@/components/a11y/skip-to-main-link";
import { Toaster } from "sonner";
import { buildMetadata } from "@/lib/seo";
import { getBrandingAssets } from "@/lib/data/site-branding";
import { BrandingHead } from "@/components/site/branding-head";
import { AdSenseSiteScript } from "@/components/ads/adsense-site-script";
import { GoogleAdsTag } from "@/components/ads/google-ads-tag";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingAssets();
  const base = buildMetadata({});
  const customFavicon = branding.favicon.current;

  if (!customFavicon) return base;

  return {
    ...base,
    icons: {
      icon: [
        { url: customFavicon },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      shortcut: customFavicon,
    },
  };
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
        className={`${inter.variable} ${grotesk.variable} ${mono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
