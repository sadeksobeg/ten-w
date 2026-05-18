#!/usr/bin/env bash
# Restart Tenegta Next.js (frees PORT, starts via PM2 ecosystem).
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
SITE="$REPO/site"
PM2="$REPO/scripts/server-pm2.sh"

unset DATABASE_URL 2>/dev/null || true

# shellcheck source=/dev/null
source "$REPO/scripts/server-use-nvm.sh"

cd "$SITE"

PORT="$(grep -E '^PORT=' .env 2>/dev/null | head -1 | cut -d= -f2 | tr -d '"' || echo 3100)"

if [ ! -d .next ]; then
  echo "Missing .next — run: bash scripts/server-update.sh (or npm run build in site/)"
  exit 1
fi

echo "Stopping old PM2 process (if any)..."
bash "$PM2" delete tenegta 2>/dev/null || true

echo "Freeing port ${PORT} (orphan listeners)..."
if command -v fuser >/dev/null 2>&1; then
  fuser -k "${PORT}/tcp" 2>/dev/null || true
elif command -v lsof >/dev/null 2>&1; then
  lsof -ti:"${PORT}" | xargs -r kill -9 2>/dev/null || true
fi
sleep 1

echo "Starting tenegta on port ${PORT}..."
bash "$PM2" start ecosystem.config.cjs
bash "$PM2" save

sleep 2
echo ""
curl -sI "http://127.0.0.1:${PORT}/en" | head -8 || true
