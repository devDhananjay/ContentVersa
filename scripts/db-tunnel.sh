#!/usr/bin/env bash
# Forward EC2 Postgres → localhost:5433 so local dev uses production data.
set -euo pipefail

KEY="${DB_TUNNEL_KEY:-$HOME/Downloads/content.pem}"
HOST="${DB_TUNNEL_HOST:-ec2-user@ec2-52-66-204-66.ap-south-1.compute.amazonaws.com}"
LOCAL_PORT="${DB_TUNNEL_LOCAL_PORT:-5433}"
REMOTE_PORT="${DB_TUNNEL_REMOTE_PORT:-5432}"

if [[ ! -f "$KEY" ]]; then
  echo "SSH key not found: $KEY"
  exit 1
fi

if lsof -i ":$LOCAL_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Tunnel already listening on localhost:$LOCAL_PORT"
  exit 0
fi

echo "Starting SSH tunnel localhost:$LOCAL_PORT → EC2:$REMOTE_PORT ..."
ssh -f -N \
  -o ExitOnForwardFailure=yes \
  -o ServerAliveInterval=30 \
  -i "$KEY" \
  -L "$LOCAL_PORT:127.0.0.1:$REMOTE_PORT" \
  "$HOST"

echo "Tunnel up. Set DATABASE_URL host to localhost:$LOCAL_PORT (see npm run db:sync-env)"
