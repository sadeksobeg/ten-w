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

NEXT_BIN="$SITE/../node_modules/next/dist/bin/next"
if [ ! -f "$NEXT_BIN" ] && [ ! -f "$SITE/node_modules/next/dist/bin/next" ]; then
  echo "Missing next — run from repo root: cd $REPO && npm ci"
  exit 1
fi

echo "Stopping old PM2 process (if any)..."
bash "$PM2" delete tenegta 2>/dev/null || true

echo "Freeing port ${PORT} (tenegta/next orphans only)..."
free_tenegta_port() {
  local p="$1"
  local pid cmd cwd
  if ! ss -tlnp 2>/dev/null | grep -q ":${p} "; then
    return 0
  fi
  pid="$(ss -tlnp 2>/dev/null | grep ":${p} " | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -1)"
  [ -n "$pid" ] || return 0
  cmd="$(tr '\0' ' ' < "/proc/${pid}/cmdline" 2>/dev/null || true)"
  cwd="$(readlink -f "/proc/${pid}/cwd" 2>/dev/null || true)"
  if [[ "$cmd" == *"next-server"* ]] || [[ "$cmd" == *"/var/www/tenegta"* ]] || [[ "$cwd" == /var/www/tenegta* ]]; then
    echo "  killing stale tenegta listener on :${p} (pid ${pid})"
    kill -9 "$pid" 2>/dev/null || true
  else
    echo "  keeping :${p} (pid ${pid}, not tenegta — e.g. clinic-os on 3100)"
  fi
}
free_tenegta_port "$PORT"
sleep 1

echo "Starting tenegta on port ${PORT}..."
bash "$PM2" start ecosystem.config.cjs
bash "$PM2" save

sleep 2
echo ""
echo "Smoke (GET /en):"
curl -fsS -o /dev/null -w "  http://127.0.0.1:${PORT}/en → HTTP %{http_code}\n" "http://127.0.0.1:${PORT}/en" || \
  echo "  WARNING: no 200 on GET /en — check: bash scripts/server-pm2.sh logs tenegta"
