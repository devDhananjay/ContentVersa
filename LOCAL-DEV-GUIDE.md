# ContentVerse — Local Development & Deploy Guide

Yeh project **ek hi repo** hai. Alag backend server nahi hai.

| Part | Kahan code hai | Example |
|------|----------------|---------|
| **Frontend** (pages, UI) | `app/`, `components/` | Homepage, blog page, dashboard |
| **Backend** (API) | `app/api/` | Sign-in, blogs, upload, admin |
| **Database** | `prisma/schema.prisma` | User, Blog, Comment models |
| **Shared logic** | `lib/` | Auth, Prisma, SEO, storage |

Local par sab **same port** par chalta hai: `http://localhost:3001`

---

## 1. Pehli baar setup (Mac / local)

### Requirements
- Node.js **20+** (`node -v`)
- npm
- Git
- Postgres (Neon cloud ya local Docker)

### Steps

```bash
cd ~/Desktop/ContentVerse

# Dependencies
npm install

# Environment (agar .env nahi hai)
cp .env.example .env
# .env mein DATABASE_URL, JWT_SECRET, GOOGLE_* fill karein

# Database
npm run db:generate
npm run db:push          # schema DB mein bhejta hai
npm run db:seed          # optional — sample data

# Dev server start
npm run dev -- -p 3001
```

Browser: **http://localhost:3001**

---

## 2. Roz ka kaam — local chalana

Terminal mein project folder kholo:

```bash
cd ~/Desktop/ContentVerse
npm run dev -- -p 3001
```

| Command | Kaam |
|---------|------|
| `npm run dev -- -p 3001` | Development server (hot reload) |
| `npm run db:studio` | Database GUI browser mein |
| `npm run db:promote-admin` | Apne email ko SUPER_ADMIN banata hai |
| `npm run lint` | Code check |

`.env` mein yeh local ke liye set hona chahiye:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3001"
DEMO_MODE="0"                    # real auth ke liye 0 rakho
DATABASE_URL="postgresql://..."  # Neon ya local Postgres
JWT_SECRET="long-random-string"
```

Google sign-in local ke liye Google Console mein add karo:
- **Redirect URI:** `http://localhost:3001/api/auth/google/callback`
- **JS origin:** `http://localhost:3001`

---

## 3. Frontend change karna

| Kya change | File / folder |
|------------|---------------|
| Homepage sections | `components/home/` |
| Blog page UI | `components/blog/`, `app/blog/[slug]/` |
| Navbar / footer | `components/site/` |
| Dashboard | `app/dashboard/`, `components/dashboard/` |
| Admin panel | `app/admin/`, `components/admin/` |
| Styles / theme | `app/globals.css`, `tailwind.config.ts` |

Flow:
1. `npm run dev -- -p 3001` chalao
2. File edit karo → browser auto refresh
3. Test karo → commit → push (neeche dekho)

---

## 4. Backend (API) change karna

Saari APIs yahan hain: **`app/api/`**

| Feature | Route file |
|---------|------------|
| Sign in / up | `app/api/auth/sign-in/route.ts`, `sign-up/` |
| Google OAuth | `app/api/auth/google/` |
| Blogs CRUD | `app/api/blogs/route.ts`, `blogs/[slug]/` |
| Comments | `app/api/blogs/[slug]/comments/` |
| Upload | `app/api/upload/route.ts` |
| Admin users | `app/api/admin/users/` |
| AI assist | `app/api/ai/assist/route.ts` |

Shared backend logic: **`lib/`** (auth, prisma, storage, data helpers)

Database model change:
```bash
# 1. prisma/schema.prisma edit karo
# 2. Schema DB mein bhejo
npm run db:push
# ya migration:
npm run db:migrate
# 3. Client regenerate
npm run db:generate
```

API test karne ke liye: **Postman collection** → `postman/ContentVerse-API.postman_collection.json`  
Details: `postman/README.md`

---

## 5. Git — changes push karna

Frontend + backend dono **ek hi repo** mein hain. Alag push nahi karna.

```bash
cd ~/Desktop/ContentVerse

# Kya badla dekho
git status
git diff

# Sab changes stage karo (ya specific files)
git add .
# git add app/api/blogs/route.ts components/blog/comments.tsx

# Commit
git commit -m "fix: comment reply UI and API validation"

# GitHub par bhejo
git push origin main
```

Branch use karna ho to:
```bash
git checkout -b feature/my-change
# ... changes ...
git add .
git commit -m "feat: add new filter on blogs page"
git push -u origin feature/my-change
# GitHub par Pull Request banao → merge into main
```

**Commit message tips:**
- `feat:` — naya feature
- `fix:` — bug fix
- `refactor:` — code cleanup, behavior same
- `chore:` — config, deps, docs

---

## 6. Production deploy (AWS EC2 — contentverse.co.in)

Jab `main` par push ho jaye, server par update karo:

```bash
# Apne Mac se EC2 par SSH
ssh -i ~/Downloads/content.pem ec2-user@ec2-52-66-204-66.ap-south-1.compute.amazonaws.com

# Server par
cd ~/ContentVersa
git pull origin main

# Prisma (agar schema badla ho)
npx prisma generate
npx prisma db push

# .env check — production values
# NEXT_PUBLIC_APP_URL=https://contentverse.co.in

# App restart (standalone build use ho raha hai)
cp -f .env build/.env
rsync -a node_modules/.prisma/ build/node_modules/.prisma/
pm2 restart next-app
```

**Note:** EC2 par `npm run build` RAM/disk kam hone se fail ho sakta hai.  
Better flow (Mac par build, server par sirf restart):

```bash
# Local Mac par
npm run build:server
git add build/
git commit -m "chore: update production build bundle"
git push origin main

# Phir server par git pull + pm2 restart (upar wale steps)
```

Production `.env` alag hai — kabhi `.env` Git par push mat karo.

---

## 7. Frontend vs Backend — quick map

```
ContentVerse/
├── app/
│   ├── page.tsx              ← Frontend (homepage)
│   ├── blog/[slug]/page.tsx  ← Frontend (blog detail)
│   ├── dashboard/            ← Frontend (creator dashboard)
│   ├── admin/                ← Frontend (admin UI)
│   └── api/                  ← BACKEND (sari REST APIs)
├── components/               ← Frontend UI parts
├── lib/                      ← Shared (auth, db, utils)
├── prisma/
│   └── schema.prisma         ← Database models
└── postman/                  ← API testing collection
```

---

## 8. Common problems

| Problem | Fix |
|---------|-----|
| Port already in use | `lsof -i :3001` → process kill karo |
| Google redirect error | Google Console mein `localhost:3001` callback add karo |
| DB connect fail | `.env` mein `DATABASE_URL` check karo |
| Prisma error | `npm run db:generate` |
| Admin access nahi | `npm run db:promote-admin` |
| Upload fail local | `BLOB_READ_WRITE_TOKEN` set karo (Vercel Blob) |

---

## 9. Useful URLs

| Environment | URL |
|-------------|-----|
| Local | http://localhost:3001 |
| Production | https://contentverse.co.in |
| GitHub | https://github.com/devDhananjay/ContentVersa |
| Admin (local) | http://localhost:3001/admin |
| Sign in (local) | http://localhost:3001/auth/sign-in |

---

## 10. Short daily checklist

1. `git pull origin main` — latest code lo
2. `npm run dev -- -p 3001` — server chalao
3. Frontend / API / schema edit karo
4. Browser + Postman se test karo
5. `git add` → `git commit` → `git push`
6. Production update: SSH → `git pull` → `pm2 restart next-app`
