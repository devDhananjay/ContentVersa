# ContentVerse — Read · Create · Grow

> The next-generation, AI-ready blog & content publishing platform.

ContentVerse is a full-stack creator platform built for the 2026 internet audience. Modern. Premium. Gen-Z. Fast.

![ContentVerse](https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600)

## Stack

- **Next.js 15** with the App Router and Turbopack
- **TypeScript**, **TailwindCSS 3.4**, **Shadcn UI** primitives
- **Framer Motion** for premium micro-interactions
- **PostgreSQL** + **Prisma 5** ORM
- **Redis** caching (with in-memory fallback)
- **JWT auth** via `jose`, OAuth-ready (Google, GitHub, OTP)
- **SEO-first** (sitemap, robots, schema.org, OpenGraph)
- **PWA-ready** manifest + dark/light themes
- **Mobile-first** with a beautiful bottom nav

## Features

### Public site
- Homepage with Hero, Trending, Featured Creators, AI Recommended, Editor's Pick, Community Posts, Weekly Trending, Newsletter, Testimonials
- Beautiful blog detail pages (TOC, reading progress bar, reactions, comments, share, tipping)
- Categories index + dedicated category pages with banners, top writers, subcategories
- Advanced search/filtering on `/blogs` (sort by trending, latest, liked, viewed, editor's choice)
- Creator profile pages
- 404, robots, sitemap, manifest, JSON-LD article schema

### Authentication
- Sign in / Sign up with email + password
- "Continue with Google" — full OAuth2 flow that upserts `User` + `Profile` + `Wallet` + linked `Account` in Postgres
- Phone OTP via **Firebase** (initialization scaffolded — fill `NEXT_PUBLIC_FIREBASE_*` to activate)
- JWT cookie sessions (HTTP-only, 30 day TTL)
- Demo mode that lets the UI render without a database

#### Setting up Google sign-in

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth client ID** → application type **Web application**.
3. Add **Authorized redirect URIs**:
   - `http://localhost:3001/api/auth/google/callback` (local)
   - `https://contentverse.co.in/api/auth/google/callback` (production)
4. Add **Authorized JavaScript origins**: `https://contentverse.co.in`
5. Paste `Client ID` and `Client secret` into `.env`:
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
5. Restart `npm run dev`. The "Continue with Google" button is now live.

#### Setting up Firebase (phone OTP)

1. Create a project at <https://console.firebase.google.com>.
2. **Project settings → Your apps → Web** → register the app → copy the `firebaseConfig`.
3. Paste the values into `.env` (the `NEXT_PUBLIC_FIREBASE_*` block).
4. **Build → Authentication → Sign-in method → Phone → enable**.
5. **Authentication → Settings → Authorized domains** → add `localhost` and your prod domain.
6. (Server side) Project settings → **Service accounts** → "Generate new private key" — save the
   JSON, paste it as a single line into `FIREBASE_ADMIN_CREDENTIALS` so ID tokens can be verified.

Once those env vars are set, `lib/firebase.ts` exposes `getFirebaseAuth()` for the Phone OTP UI.

### User dashboard
- Overview with analytics cards, streak system, performance chart
- My Blogs (drafts, pending, published, rejected, archived)
- Create page with a **block editor** (slash commands, multiple block types, callouts, code, embeds)
- Tabbed editor (Write / Preview / SEO) with Google preview
- Analytics page (charts, traffic sources, audience insights)
- Earnings (wallet, payouts, multiple revenue sources)
- Notifications, Settings, Bookmarks, Leaderboard

### Admin panel
- Moderation Queue with approve / reject / request changes
- Categories management
- Users (roles, verification, bans, warnings)
- Revenue (MRR, ARR, monetization controls)
- Platform analytics
- Reports queue
- CMS settings (homepage sections, banner, trending logic)

### Content submission flow
```
User creates blog → selects category → adds SEO data → saves draft →
submits for review → admin reviews → APPROVED (auto-publish)
                                     or REJECTED (feedback shown, user re-edits)
```

## Project structure

```
app/                  # Next.js App Router (routes, layouts, API)
  (marketing pages: /, /blogs, /blog/[slug], /category, /categories, etc.)
  auth/               # sign-in, sign-up
  dashboard/          # creator dashboard
  admin/              # admin panel
  api/                # REST API routes
  profile/[username]/ # public creator profiles
components/
  ui/                 # shadcn-style primitives
  site/               # navbar, footer, mobile nav, logo
  home/               # homepage sections
  blog/               # blog cards, TOC, reactions, comments, share, markdown
  editor/             # block editor with slash commands
  dashboard/          # dashboard sidebar, stat cards
  admin/              # admin sidebar
lib/
  prisma.ts           # singleton Prisma client
  auth.ts             # JWT sign/verify, cookie helpers
  redis.ts            # cache wrapper (Redis or in-memory)
  seo.ts              # metadata + JSON-LD builders
  utils.ts            # cn, formatNumber, slugify, timeAgo…
  data/               # mock content (matches Prisma schema)
prisma/
  schema.prisma       # full production schema (17+ models)
  seed.ts             # seeds users, categories, blogs
```

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
#   Update DATABASE_URL, JWT_SECRET, etc.

# 3. (Optional) Bring up Postgres & Redis
docker run --name cv-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
docker run --name cv-redis -p 6379:6379 -d redis:7

# 4. Generate Prisma client and push schema
npm run db:generate
npm run db:push
npm run db:seed

# 5. Start the dev server
npm run dev
```

The site falls back to fully-working **demo mode** if Postgres/Redis are not available — every page renders with realistic mock data so you can preview the platform immediately.

## Environment variables

See `.env.example`. The most important ones:

| Variable        | Description                                  |
| --------------- | -------------------------------------------- |
| `DATABASE_URL`  | Postgres connection string                   |
| `JWT_SECRET`    | Long random string for signing sessions      |
| `REDIS_URL`     | Optional Redis URL for caching               |
| `DEMO_MODE`     | `0` to enforce auth on `/dashboard`/`/admin` |
| `NEXT_PUBLIC_APP_URL` | Public site URL (used in SEO/sitemap)  |

## Database schema

Models: `User`, `Profile`, `Account`, `Session`, `Category`, `Subcategory`, `Blog`, `Tag`, `BlogTag`, `Comment`, `Reaction`, `Bookmark`, `Follower`, `SubmissionQueue`, `AdminReview`, `Notification`, `Wallet`, `Revenue`, `Tip`, `Achievement`, `UserAchievement`, `Analytics`, `ReadingHistory`, `SiteSetting`, `NewsletterSubscriber`.

## API surface

```
POST  /api/auth/sign-in
POST  /api/auth/sign-up
POST  /api/auth/sign-out
GET   /api/auth/me
GET   /api/auth/google/login            # start Google OAuth
GET   /api/auth/google/callback         # OAuth callback → upserts user + signs JWT cookie
POST  /api/auth/firebase                # exchange Firebase phone-OTP ID token → upsert + JWT cookie

GET   /api/blogs?q=&category=&sort=&limit=
POST  /api/blogs                          # create draft + submit for review
GET   /api/blogs/[slug]
POST  /api/blogs/[slug]/reactions
GET   /api/blogs/[slug]/comments
POST  /api/blogs/[slug]/comments

GET   /api/categories
GET   /api/search?q=

GET   /api/admin/moderation               # MOD/ADMIN
POST  /api/admin/moderation               # approve / reject / request changes

POST  /api/newsletter
```

## Design language

- **Primary**: Electric Purple → Electric Blue
- **Accents**: Neon Cyan, Soft Pink, Orange CTA
- **Typography**: `Space Grotesk` (display) + `Inter` (sans) + `JetBrains Mono`
- **Aesthetics**: Glassmorphism, neon gradients, grid-noise overlays, smooth Framer Motion transitions, micro-interactions on hover

## Monetization

The schema and admin panel are wired for:

1. Google Ads
2. Sponsored articles
3. Premium membership
4. Creator subscriptions
5. Affiliate links
6. Paid content (gated articles)
7. Tip / donation system
8. Brand collaborations
9. Newsletter sponsorship
10. Marketplace promotions

## Roadmap (hooks already in place)

- Real-time notifications (Server-Sent Events)
- Multi-language i18n
- Voice-read articles (Web Speech API)
- PWA offline reading
- AI assistant (slash command in editor)
- Stripe-backed creator payouts

## License

MIT — © ContentVerse
