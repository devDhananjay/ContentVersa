#!/usr/bin/env bash
# Daily AI articles — run twice on EC2 crontab for better quality (half categories each run)
#   6:30 AM IST:  bash scripts/cron-daily-articles.sh first
#   6:30 PM IST:  bash scripts/cron-daily-articles.sh second
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
PER_CAT="${DAILY_AI_PER_CATEGORY:-1}"
SLOT="${1:-all}"
# Half of 24 categories per run when using first/second
MAX="${DAILY_AI_MAX_TOTAL:-12}"
if [[ -z "$CRON_SECRET" ]]; then
  echo "CRON_SECRET not set in .env" >&2
  exit 1
fi
echo "[cron] daily-articles slot=${SLOT} perCategory=${PER_CAT} max=${MAX}"
curl -sfS -H "Authorization: Bearer ${CRON_SECRET}" \
  "${APP_URL}/api/cron/daily-articles?slot=${SLOT}&perCategory=${PER_CAT}&max=${MAX}"
echo ""
