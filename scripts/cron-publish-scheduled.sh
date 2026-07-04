#!/usr/bin/env bash
# Publish blogs whose scheduledFor time has passed (run every 5–15 minutes)
set -euo pipefail
cd "$(dirname "$0")/.."
ENV_FILE=".env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing .env" >&2
  exit 1
fi
CRON_SECRET=$(grep -E '^CRON_SECRET=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"')
APP_URL=$(grep -E '^APP_URL=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"')
APP_URL=${APP_URL:-https://contentverse.co.in}
if [[ -z "$CRON_SECRET" ]]; then
  echo "CRON_SECRET not set in .env" >&2
  exit 1
fi
curl -sfS -H "Authorization: Bearer ${CRON_SECRET}" \
  "${APP_URL}/api/cron/publish-scheduled"
echo ""
