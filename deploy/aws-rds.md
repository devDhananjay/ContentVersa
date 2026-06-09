# AWS RDS Postgres (ContentVerse)

Production database: **AWS RDS PostgreSQL** — same region as EC2 (`ap-south-1` recommended).

## 1. Create RDS instance

AWS Console → **RDS** → **Create database**

| Setting | Value |
|---------|--------|
| Engine | PostgreSQL 16 |
| Template | Free tier (dev) or Production |
| DB identifier | `contentverse-db` |
| Master username | `contentverse` |
| Database name | `contentverse` |
| VPC | **Same VPC as your EC2** |
| Public access | **No** (EC2 connects privately) |

Note the endpoint, e.g. `contentverse-db.xxxxx.ap-south-1.rds.amazonaws.com`.

## 2. Security group

RDS security group → **Inbound rules**:

- Type: PostgreSQL
- Port: 5432
- Source: EC2 security group (not `0.0.0.0/0`)

## 3. EC2 `.env`

On the server (`~/ContentVersa/.env`):

```env
DATABASE_URL="postgresql://contentverse:YOUR_PASSWORD@contentverse-db.xxxxx.ap-south-1.rds.amazonaws.com:5432/contentverse?sslmode=require"
```

Then:

```bash
npx prisma generate
npx prisma db push
npm run db:seed          # optional first-time data
cp -f .env build/.env
pm2 restart next-app
```

## 4. Local dev

Option A — Docker Postgres on your Mac (default in `.env.example`):

```bash
docker run --name cv-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=contentverse \
  -p 5432:5432 -d postgres:16
npm run db:push && npm run db:seed
```

Option B — Point local `.env` at RDS (only if RDS has a tunnel or temporary public access; not recommended for production RDS).

## 5. Migrate from Neon

1. Export Neon: `pg_dump "$OLD_NEON_URL" > backup.sql`
2. Import RDS: `psql "$RDS_DATABASE_URL" < backup.sql`
3. Update `DATABASE_URL` on EC2 and locally
4. Restart app
