#!/usr/bin/env bash
# Daily AI articles — run on EC2 crontab at 6:00 AM IST
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
PER_CAT="${DAILY_AI_PER_CATEGORY:-1}"
MAX="${DAILY_AI_MAX_TOTAL:-24}"
if [[ -z "$CRON_SECRET" ]]; then
  echo "CRON_SECRET not set in .env" >&2
  exit 1
fi
curl -sfS -H "Authorization: Bearer ${CRON_SECRET}" \
  "${APP_URL}/api/cron/daily-articles?perCategory=${PER_CAT}&max=${MAX}"
echo ""
