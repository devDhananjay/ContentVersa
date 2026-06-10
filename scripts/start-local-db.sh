#!/usr/bin/env bash
# Start local Postgres for ContentVerse dev (Docker preferred).
set -euo pipefail

if command -v docker >/dev/null 2>&1; then
  if docker ps -a --format '{{.Names}}' | grep -qx cv-postgres; then
    docker start cv-postgres
  else
    docker run --name cv-postgres \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=contentverse \
      -p 5432:5432 \
      -d postgres:16
  fi
  echo "Postgres running on localhost:5432 (user: postgres / pass: postgres / db: contentverse)"
  echo "Run: npm run db:push && npm run db:seed"
  exit 0
fi

if command -v pg_isready >/dev/null 2>&1 && pg_isready -h localhost -p 5432 -q 2>/dev/null; then
  echo "Postgres already running on localhost:5432"
  exit 0
fi

echo "No Docker and no local Postgres found."
echo "Install Docker Desktop, or: brew install postgresql@16 && brew services start postgresql@16"
exit 1
