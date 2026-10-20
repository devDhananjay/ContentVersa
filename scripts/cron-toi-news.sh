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
# Hit local Next (bypass nginx 60s proxy_read_timeout) — Gemini rewrites need minutes.
LOCAL_URL="${TOI_NEWS_LOCAL_URL:-http://127.0.0.1:3000}"
MAX="${TOI_NEWS_MAX_PER_RUN:-2}"
if [[ -z "$CRON_SECRET" ]]; then
  echo "CRON_SECRET not set in .env" >&2
  exit 1
fi
echo "[cron] toi-news max=${MAX} via ${LOCAL_URL} $(date -u +%Y-%m-%dT%H:%M:%SZ)"
# force=1 — TOI live desk runs even if admin AI auto-gen toggle is off
URL="${LOCAL_URL%/}/api/cron/toi-news?max=${MAX}&force=1"
# Fail-fast ingest should finish well under 2 min; don't hold the cron for 280s.
curl -sfS --max-time 120 -H "Authorization: Bearer ${CRON_SECRET}" "$URL"
echo ""
