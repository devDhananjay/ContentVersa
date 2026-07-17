#!/usr/bin/env bash
# Daily AI articles — one draft blog per category from Google News trending topics.
# Content only (no cover). Schedule on EC2:
#   11:00 PM IST = 17:30 UTC
#   30 17 * * * cd /home/ec2-user/ContentVersa && bash scripts/cron-daily-articles.sh all >> /tmp/daily-articles.log 2>&1
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
# All categories (~21) in one nightly run
MAX="${DAILY_AI_MAX_TOTAL:-24}"
if [[ -z "$CRON_SECRET" ]]; then
  echo "CRON_SECRET not set in .env" >&2
  exit 1
fi
echo "[cron] daily-articles slot=${SLOT} perCategory=${PER_CAT} max=${MAX}"
# Run in-process — HTTP cron hits 504 when Gemini takes >60s across many categories.
npx tsx scripts/daily-ai-articles.ts \
  --slot="${SLOT}" \
  --per-category="${PER_CAT}" \
  --max="${MAX}"
echo ""
