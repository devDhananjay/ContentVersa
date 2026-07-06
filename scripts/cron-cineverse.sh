#!/usr/bin/env bash
# CineVerse cron — trailers daily, OTT weekly digest (Friday IST morning)
set -euo pipefail
cd "$(dirname "$0")/.."
ENV_FILE=".env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing .env" >&2
  exit 1
fi
CRON_SECRET=$(grep -E '^CRON_SECRET=' "$ENV_FILE" | head -1 | cut -d= -f2-)
APP_URL=$(grep -E '^APP_URL=' "$ENV_FILE" | head -1 | cut -d= -f2-)
APP_URL=${APP_URL:-https://contentverse.co.in}
JOB="${1:?Usage: cron-cineverse.sh trailers|ott-weekly}"
if [[ -z "$CRON_SECRET" ]]; then
  echo "CRON_SECRET not set in .env" >&2
  exit 1
fi
curl -sfS -H "Authorization: Bearer ${CRON_SECRET}" \
  "${APP_URL}/api/cron/cineverse?job=${JOB}"
echo ""
