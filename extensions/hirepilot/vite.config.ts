import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  manifest_version: 3,
  name: "ContentVerse HirePilot",
  description:
    "ContentVerse HirePilot — Find jobs. Understand jobs. Apply smarter. Match score, cover letters & tracker for LinkedIn and Naukri.",
  version: "0.1.0",
  action: {
    default_popup: "src/popup/index.html",
    default_title: "ContentVerse HirePilot",
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  permissions: ["storage", "activeTab", "tabs", "scripting"],
  host_permissions: [
    "https://www.linkedin.com/*",
    "https://linkedin.com/*",
    "https://www.naukri.com/*",
    "https://naukri.com/*",
    "https://contentverse.co.in/*",
    "http://localhost:3001/*",
    "http://localhost:3000/*",
  ],
  content_scripts: [
    {
      matches: ["https://www.linkedin.com/*", "https://linkedin.com/*"],
      js: ["src/content/linkedin.ts"],
      run_at: "document_idle",
    },
    {
      matches: ["https://www.naukri.com/*", "https://naukri.com/*"],
      js: ["src/content/naukri.ts"],
      run_at: "document_idle",
    },
    {
      matches: [
        "https://contentverse.co.in/jobpilot/login*",
        "http://localhost:3001/jobpilot/login*",
        "http://localhost:3000/jobpilot/login*",
      ],
      js: ["src/content/login-bridge.ts"],
      run_at: "document_idle",
    },
  ],
  icons: {
    "16": "public/icon-16.png",
    "48": "public/icon-48.png",
    "128": "public/icon-128.png",
  },
});

export default defineConfig({
  // Relative asset URLs so the Chrome extension popup can load scripts/CSS
  // from chrome-extension://… (absolute `/assets/…` breaks nested popup HTML).
  base: "./",
  plugins: [react(), tailwindcss(), crx({ manifest })],
  build: {
    sourcemap: true,
  },
});
