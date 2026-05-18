#!/usr/bin/env bash
# PM2 via TENEGTA Node 20 (works even when `pm2` is not on system PATH).
set -euo pipefail
REPO="${REPO:-/var/www/tenegta}"
# shellcheck source=/dev/null
source "$REPO/scripts/server-use-nvm.sh"
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi
exec pm2 "$@"
