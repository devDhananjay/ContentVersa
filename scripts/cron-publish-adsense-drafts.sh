#!/usr/bin/env bash
# AdSense-safe draft drip publish — run once daily (IST morning recommended)
# Default: 2 unique, high-quality DRAFT blogs/day. Skips duplicates vs live.
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
LIMIT="${1:-}"
if [[ -z "$CRON_SECRET" ]]; then
  echo "CRON_SECRET not set in .env" >&2
  exit 1
fi
URL="${APP_URL}/api/cron/publish-adsense-drafts"
if [[ -n "$LIMIT" ]]; then
  URL="${URL}?limit=${LIMIT}"
fi
curl -sfS -H "Authorization: Bearer ${CRON_SECRET}" "$URL"
echo ""
