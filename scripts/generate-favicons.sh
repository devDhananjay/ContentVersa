#!/usr/bin/env bash
# Regenerate favicon assets from public/logo-icon.png (brain logo, 512×512).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/public/logo-icon.png"

for size in 16 32 48 180 192 512; do
  case "$size" in
    16) out="$ROOT/public/favicon-16x16.png" ;;
    32) out="$ROOT/public/favicon-32x32.png" ;;
    48) out="$ROOT/public/favicon-48x48.png" ;;
    180) out="$ROOT/public/apple-touch-icon.png" ;;
    192) out="$ROOT/public/icon-192.png" ;;
    512) out="$ROOT/public/icon-512.png" ;;
  esac
  sips -z "$size" "$size" "$SRC" --out "$out" >/dev/null
done

cp "$ROOT/public/apple-touch-icon.png" "$ROOT/app/apple-icon.png"
npx --yes png-to-ico \
  "$ROOT/public/favicon-16x16.png" \
  "$ROOT/public/favicon-32x32.png" \
  "$ROOT/public/favicon-48x48.png" \
  > "$ROOT/public/favicon.ico"
cp "$ROOT/public/favicon.ico" "$ROOT/app/favicon.ico"
echo "Favicons updated from logo-icon.png"
