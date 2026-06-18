#!/usr/bin/env bash
# Cricket match + stock watchlist push alerts — run on EC2 crontab
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
JOB="${1:?Usage: cron-push-alerts.sh cricket|stocks}"
if [[ -z "$CRON_SECRET" ]]; then
  echo "CRON_SECRET not set in .env" >&2
  exit 1
fi
curl -sfS -H "Authorization: Bearer ${CRON_SECRET}" \
  "${APP_URL}/api/cron/push-alerts?job=${JOB}"
echo ""
