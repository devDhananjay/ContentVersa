# ContentVerse Postman

Import these files into [Postman](https://www.postman.com/):

| File | Purpose |
|------|---------|
| `ContentVerse-API.postman_collection.json` | All API routes |
| `ContentVerse-Production.postman_environment.json` | `https://contentverse.co.in` |
| `ContentVerse-Local.postman_environment.json` | `http://localhost:3001` |

## Import steps

1. Postman → **Import** → select the 3 JSON files
2. Top-right environment → choose **Production** or **Local**
3. Run **Auth → Sign In** (saves `cv_session` cookie)
4. Call other APIs

## Auth

Protected routes need cookie `cv_session` from sign-in or Google OAuth (browser).

**Promote user without login:** set `bootstrapSecret` in environment = server `ADMIN_BOOTSTRAP_SECRET`, then **Admin → Promote User by Email**.

## API summary (27 route files · 60 Postman requests)

| Folder | Routes | Methods |
|--------|--------|---------|
| 01 Auth | `auth/*`, `me/reading` | GET me (+ total reading time), sign-in/up, google, firebase |
| 01b Users | `users/:username/follow` | GET follow status, POST toggle follow |
| 02 Blogs | `blogs/*` | GET list, POST create, GET slug, **summary, recommendations, history (reading time), feedback** |
| 03 Reactions | `blogs/[slug]/reactions` | GET, POST ×5 |
| 04 Bookmarks | `blogs/[slug]/bookmark` | GET, POST |
| 05 Comments | `blogs/[slug]/comments/*` | GET, POST, reply, like |
| 06 Polls | `polls/[slug]` | GET, POST (blog polls: `blog-{slug}`) |
| 07 AI | `ai/assist` | POST summarize, **article-summary**, seo, ideas, image, etc. |
| 08–13 | admin, upload, search, categories, newsletter | as before |

### New reader / AI endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/blogs/:slug/summary` | Inshorts-style short (~60 words, Gemini 1.5 Flash) |
| GET | `/api/blogs/:slug/recommendations` | Blogs you may like |
| GET | `/api/blogs/:slug/history` | Seconds on article + total reading time |
| POST | `/api/blogs/:slug/history` | Heartbeat `{ seconds, progress }` (cookie `cv_reader`) |
| GET | `/api/me/reading` | Logged-in user total reading stats |
| GET/POST | `/api/users/:username/follow` | Follow status / toggle |
| GET/POST | `/api/blogs/:slug/feedback` | Was this helpful? |

**Note:** One Next.js app — all APIs under `/api/*` on the same domain.
