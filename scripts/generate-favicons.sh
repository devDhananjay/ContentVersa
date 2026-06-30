#!/usr/bin/env bash
# Circular favicons with gradient border from public/logo-icon.png
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npx --yes -p sharp node scripts/generate-favicons.mjs
