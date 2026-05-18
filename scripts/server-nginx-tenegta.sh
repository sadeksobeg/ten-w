#!/usr/bin/env bash
# Install scripts/nginx/tenegta.com.conf → /etc/nginx/sites-available/tenegta.com
# Run on VPS as root or with sudo: bash scripts/server-nginx-tenegta.sh
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$REPO/scripts/nginx/tenegta.com.conf"
DEST="/etc/nginx/sites-available/tenegta.com"
ENABLED="/etc/nginx/sites-enabled/tenegta.com"
CERT="/etc/letsencrypt/live/tenegta.com/fullchain.pem"

if [[ ! -f "$SRC" ]]; then
  echo "ERROR: missing $SRC — run git pull in $REPO"
  exit 1
fi

if [[ "$(id -u)" -ne 0 ]] && ! command -v sudo >/dev/null 2>&1; then
  echo "ERROR: run as root or install sudo"
  exit 1
fi

run() {
  if [[ "$(id -u)" -eq 0 ]]; then
    "$@"
  else
    sudo "$@"
  fi
}

if [[ ! -f "$CERT" ]]; then
  echo "ERROR: SSL certificate not found: $CERT"
  echo "  sudo certbot --nginx -d tenegta.com -d www.tenegta.com"
  exit 1
fi

if [[ -f "$DEST" ]]; then
  BACKUP="$DEST.bak.$(date +%Y%m%d%H%M%S)"
  run cp -a "$DEST" "$BACKUP"
  echo "==> backed up existing config to $BACKUP"
fi

echo "==> installing $SRC -> $DEST"
run cp "$SRC" "$DEST"
run ln -sf "$DEST" "$ENABLED"

echo "==> nginx -t"
run nginx -t

echo "==> reload nginx"
run systemctl reload nginx

echo ""
echo "OK: tenegta.com nginx config applied (gzip + static cache + security headers + proxy :3100)"
echo "==> key lines in $DEST:"
grep -nE "^\s*(upstream tenegta_next|Strict-Transport-Security|gzip on|location /_next/static/)" "$DEST" || true
