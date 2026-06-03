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

## API summary (23 route files · 53 Postman requests)

| Folder | Route file | Methods |
|--------|-----------|---------|
| 01 Auth | auth/* | GET me, POST sign-in/sign-up/sign-out, GET google login/callback, POST firebase |
| 02 Blogs | blogs/route.ts, blogs/[slug] | GET list (7 sort variants), POST create, GET slug |
| 03 Reactions | blogs/[slug]/reactions | GET, POST ×5 types |
| 04 Bookmarks | blogs/[slug]/bookmark | GET, POST |
| 05 Comments | blogs/[slug]/comments/* | GET, POST, POST reply, POST like |
| 06 Polls | polls/[slug] | GET, POST |
| 07 AI | ai/assist | POST ×8 actions |
| 08 Admin Users | admin/users/* | GET, POST, POST promote, PATCH ×3 |
| 09 Moderation | admin/moderation | GET, POST ×3 decisions |
| 10 Upload | upload | POST |
| 11 Search | search | GET |
| 12 Categories | categories | GET |
| 13 Newsletter | newsletter | POST |

**Note:** This project has no separate backend server — all routes live under `/api/*` on the same domain. Pages like `/admin`, `/dashboard` are Next.js pages (not REST APIs).
