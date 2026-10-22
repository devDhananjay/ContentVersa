#!/usr/bin/env bash
# ContentVerse — Telegram tips (5–6×/day, 2–3h gap). Not a mass blaster.
# Usage: cron-telegram-tips.sh <slot 0-5>
# Crontab (IST):
#   TZ=Asia/Kolkata
#   0 8  * * * .../cron-telegram-tips.sh 0 >> /tmp/telegram-tips.log 2>&1
#   0 11 * * * .../cron-telegram-tips.sh 1 >> /tmp/telegram-tips.log 2>&1
#   0 14 * * * .../cron-telegram-tips.sh 2 >> /tmp/telegram-tips.log 2>&1
#   0 17 * * * .../cron-telegram-tips.sh 3 >> /tmp/telegram-tips.log 2>&1
#   0 20 * * * .../cron-telegram-tips.sh 4 >> /tmp/telegram-tips.log 2>&1
#   0 22 * * * .../cron-telegram-tips.sh 5 >> /tmp/telegram-tips.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."
ENV_FILE=".env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing .env" >&2
  exit 1
fi
CRON_SECRET=$(grep -E '^CRON_SECRET=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
APP_URL=$(grep -E '^APP_URL=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
APP_URL=${APP_URL:-https://contentverse.co.in}
SLOT="${1:?Usage: cron-telegram-tips.sh <slot 0-5>}"
if [[ -z "$CRON_SECRET" ]]; then
  echo "CRON_SECRET not set in .env" >&2
  exit 1
fi
echo "[cron] telegram-tips slot=${SLOT} $(date -u +%Y-%m-%dT%H:%M:%SZ)"
curl -sfS -H "Authorization: Bearer ${CRON_SECRET}" \
  "${APP_URL}/api/cron/telegram-tips?slot=${SLOT}"
echo ""
