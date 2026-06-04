#!/usr/bin/env bash
# Quick diagnostics on the VPS.
set -euo pipefail
REPO="${REPO:-/var/www/tenegta}"
cd "$REPO"

# shellcheck source=/dev/null
source "$REPO/scripts/server-use-nvm.sh"

PORT="$(grep -E '^PORT=' site/.env 2>/dev/null | head -1 | cut -d= -f2 | tr -d '"' || echo 3100)"

echo "Node: $(node -v)"
echo "PORT from site/.env: $PORT"
echo ""
echo "Listening on $PORT:"
ss -tlnp 2>/dev/null | grep ":${PORT} " || netstat -tlnp 2>/dev/null | grep ":${PORT} " || echo "(install ss or netstat)"
PID_ON_PORT="$(ss -tlnp 2>/dev/null | grep ":${PORT} " | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -1)"
if [ -n "$PID_ON_PORT" ] && [ -r "/proc/$PID_ON_PORT/cmdline" ]; then
  echo "Process on ${PORT}: $(tr '\0' ' ' < "/proc/$PID_ON_PORT/cmdline" | head -c 200)"
fi
echo ""
echo "next binary:"
ls -la "$REPO/node_modules/next/dist/bin/next" 2>/dev/null || ls -la "$REPO/site/node_modules/next/dist/bin/next" 2>/dev/null || echo "  MISSING — run: cd $REPO && npm ci"
echo ""
echo "PM2:"
bash "$REPO/scripts/server-pm2.sh" status 2>/dev/null || echo "pm2 not running"
echo ""
echo "PM2 logs (last 15 lines):"
bash "$REPO/scripts/server-pm2.sh" logs tenegta --lines 15 --nostream 2>/dev/null || true
echo ""
if [ -d "$REPO/site/.next" ]; then
  echo "Build: site/.next exists"
else
  echo "Build: MISSING site/.next — run bash scripts/server-update.sh"
fi
echo ""
echo "Direct app (GET /en — use this, not curl -I):"
GET_CODE="$(curl -fsS -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/en" 2>/dev/null || echo "000")"
HEAD_CODE="$(curl -sI -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/en" 2>/dev/null || echo "000")"
echo "  GET  http://127.0.0.1:${PORT}/en → HTTP ${GET_CODE}"
echo "  HEAD http://127.0.0.1:${PORT}/en → HTTP ${HEAD_CODE} (curl -I; may differ on some Next builds)"
if [ "$GET_CODE" != "200" ] && [ "$GET_CODE" != "307" ] && [ "$GET_CODE" != "308" ]; then
  echo "  WARNING: app not healthy on :${PORT}. Compare nginx upstream:"
  grep -Rhn "127.0.0.1:310" /etc/nginx/sites-enabled/ 2>/dev/null | grep -v ".bak" || true
fi
echo ""
echo "Via nginx (HTTPS /ar):"
curl -sI -o /dev/null -w "  https://tenegta.com/ar → HTTP %{http_code}\n" \
  -H "Host: tenegta.com" "https://127.0.0.1/ar" -k \
  --resolve "tenegta.com:443:127.0.0.1" 2>/dev/null || \
  echo "  (local HTTPS curl skipped — run server-diagnose-access.sh)"
echo ""
if [ -f "$REPO/scripts/server-generated-credentials.txt" ]; then
  echo "Credentials: $REPO/scripts/server-generated-credentials.txt"
else
  echo "No server-generated-credentials.txt (site/.env was created manually)"
fi
