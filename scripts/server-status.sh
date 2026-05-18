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
echo ""
echo "PM2:"
bash "$REPO/scripts/server-pm2.sh" status 2>/dev/null || echo "pm2 not running"
echo ""
echo "HTTP /en:"
curl -sI "http://127.0.0.1:${PORT}/en" | head -5 || true
echo ""
if [ -f "$REPO/scripts/server-generated-credentials.txt" ]; then
  echo "Credentials: $REPO/scripts/server-generated-credentials.txt"
else
  echo "No server-generated-credentials.txt (site/.env was created manually)"
fi
