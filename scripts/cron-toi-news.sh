#!/usr/bin/env bash
# TOI RSS → rewrite → site blogs every 30 minutes.
# Schedule on EC2 (UTC):
#   */30 * * * * cd /home/ec2-user/ContentVersa && bash scripts/cron-toi-news.sh >> /tmp/toi-news.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."
ENV_FILE=".env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing .env" >&2
  exit 1
fi
MAX="${TOI_NEWS_MAX_PER_RUN:-2}"
echo "[cron] toi-news max=${MAX} $(date -u +%Y-%m-%dT%H:%M:%SZ)"
# In-process — HTTP cron can 504 while Gemini rewrites.
npx tsx scripts/toi-news-ingest.ts --max="${MAX}"
echo ""
