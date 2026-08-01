import type { MetadataRoute } from "next";
import { DEFAULT_FAVICON_ICONS } from "@/lib/branding/favicon";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ContentVerse India",
    short_name: "ContentVerse India",
    description: "ContentVerse India — Read. Create. Grow. Blogs, sports, finance, MoneyVerse, CineVerse and free India tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#a855f7",
    icons: [
      { src: DEFAULT_FAVICON_ICONS.primary, sizes: "48x48", type: "image/png" },
      { src: DEFAULT_FAVICON_ICONS.large, sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
