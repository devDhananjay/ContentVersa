# ContentVerse HirePilot — Chrome Extension

Part of the [ContentVerse](https://contentverse.co.in) monorepo.  
**Same domain, same backend** — no separate server or domain needed.

Find jobs. Understand jobs. Apply smarter.

## Features

- Job scrape on **LinkedIn** + **Naukri**
- **Match score** + **Should You Apply?**
- Resume upload (paste text)
- Cover letters (Professional / Short / Startup)
- Save to **Job Tracker** (web: `/jobpilot/tracker`)
- Freemium: 5 analyses / 3 cover letters per month

## Backend (already in ContentVerse)

APIs live on `contentverse.co.in`:

- `/api/jobpilot/*` — auth, resume, analyze, cover-letter, tracker
- `/jobpilot` — resume upload dashboard
- `/jobpilot/login?ext=1` — extension token bridge
- `/jobpilot/tracker` — application tracker

## Setup

From repo root:

```bash
npm run hirepilot:install
npm run hirepilot:build
```

Or from this folder:

```bash
cd extensions/hirepilot
npm install
npm run build
```

Load in Chrome:

1. `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select `extensions/hirepilot/dist`

Dev (hot reload):

```bash
npm run hirepilot:dev
```

## Connect account

1. Click **Sign in / Connect** in the popup
2. Sign in on ContentVerse (`/jobpilot/login?ext=1`)
3. Token is stored in extension storage automatically

Local API:

```js
chrome.storage.local.set({ jobpilot_api_base: 'http://localhost:3001' })
```
