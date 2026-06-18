#!/usr/bin/env bash
# Start Next standalone with build/.env loaded (PM2 does not load .env automatically).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/build"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
elif [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "WARNING: DATABASE_URL not set — blogs will not load from Postgres." >&2
fi

exec node server.js
