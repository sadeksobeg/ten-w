#!/usr/bin/env bash
# Install scripts/nginx/mail.tenegta.com.conf for Mailcow on 127.0.0.1:8443
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
SRC="$REPO/scripts/nginx/mail.tenegta.com.conf"
DEST="/etc/nginx/sites-available/mail.tenegta.com"
ENABLED="/etc/nginx/sites-enabled/mail.tenegta.com"
CERT="/etc/letsencrypt/live/mail.tenegta.com/fullchain.pem"

if [[ ! -f "$SRC" ]]; then
  echo "ERROR: missing $SRC — run git pull in $REPO"
  exit 1
fi

run() {
  if [[ "$(id -u)" -eq 0 ]]; then "$@"; else sudo "$@"; fi
}

if [[ ! -f "$CERT" ]]; then
  echo "WARNING: $CERT not found."
  echo "  sudo certbot certonly --nginx -d mail.tenegta.com -d autodiscover.tenegta.com -d autoconfig.tenegta.com"
  echo "  Or use existing Mailcow cert path if different."
fi

if [[ -f "$DEST" ]]; then
  run cp -a "$DEST" "$DEST.bak.$(date +%Y%m%d%H%M%S)"
fi

run cp "$SRC" "$DEST"
run ln -sf "$DEST" "$ENABLED"
run nginx -t
run systemctl reload nginx 2>/dev/null || run systemctl start nginx

echo "OK: mail.tenegta.com → https://127.0.0.1:8443"
