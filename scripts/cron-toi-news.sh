#!/usr/bin/env bash
# TOI RSS → rewrite → site blogs every 30 minutes.
# Prefers HTTP cron (standalone app has deps). Falls back to local tsx if APP_URL down.
# Schedule on EC2 (UTC):
#   */30 * * * * /home/ec2-user/ContentVersa/scripts/cron-toi-news.sh >> /home/ec2-user/logs/toi-news.log 2>&1
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
MAX="${TOI_NEWS_MAX_PER_RUN:-2}"
if [[ -z "$CRON_SECRET" ]]; then
  echo "CRON_SECRET not set in .env" >&2
  exit 1
fi
echo "[cron] toi-news max=${MAX} $(date -u +%Y-%m-%dT%H:%M:%SZ)"
# force=1 — TOI live desk runs even if admin AI auto-gen toggle is off
URL="${APP_URL%/}/api/cron/toi-news?max=${MAX}&force=1"
# Long Gemini rewrites — allow up to 4 minutes
if curl -sfS --max-time 240 -H "Authorization: Bearer ${CRON_SECRET}" "$URL"; then
  echo ""
  exit 0
fi
echo "[cron] HTTP failed — trying in-process tsx with build/node_modules" >&2
export NODE_PATH="$(pwd)/build/node_modules${NODE_PATH:+:$NODE_PATH}"
npx tsx scripts/toi-news-ingest.ts --max="${MAX}" --force
echo ""
