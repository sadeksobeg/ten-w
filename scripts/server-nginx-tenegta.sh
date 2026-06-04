#!/usr/bin/env bash
# Install scripts/nginx/tenegta.com.conf → /etc/nginx/sites-available/tenegta.com
# Run on VPS as root or with sudo: bash scripts/server-nginx-tenegta.sh
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$REPO/scripts/nginx/tenegta.com.conf"
DEST="/etc/nginx/sites-available/tenegta.com"
ENABLED="/etc/nginx/sites-enabled/tenegta.com"
CERT="/etc/letsencrypt/live/tenegta.com/fullchain.pem"
APP_PORT="$(grep -E '^PORT=' "$REPO/site/.env" 2>/dev/null | head -1 | cut -d= -f2 | tr -d '"' || echo 3100)"

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

echo "==> installing nginx config (upstream 127.0.0.1:${APP_PORT} from site/.env)"
sed "s/127.0.0.1:3100/127.0.0.1:${APP_PORT}/g; s/on 127.0.0.1:3100/on 127.0.0.1:${APP_PORT}/g" "$SRC" | run tee "$DEST" >/dev/null
run ln -sf "$DEST" "$ENABLED"

echo "==> nginx -t"
run nginx -t

echo "==> start or reload nginx"
if run systemctl is-active --quiet nginx; then
  run systemctl reload nginx
else
  if ss -tlnp 2>/dev/null | grep -q '0.0.0.0:443.*docker-proxy'; then
    echo "ERROR: port 443 is still used by Mailcow (docker-proxy)."
    echo "  Run first: sudo bash $REPO/scripts/server-mailcow-reverse-proxy.sh"
    exit 1
  fi
  run systemctl enable nginx
  run systemctl start nginx
fi

if ! run systemctl is-active --quiet nginx; then
  echo "ERROR: nginx failed to start. Check:"
  echo "  sudo journalctl -xeu nginx.service --no-pager | tail -40"
  echo "  ss -tlnp | grep -E ':443|:80'"
  exit 1
fi

echo ""
echo "OK: tenegta.com nginx config applied (gzip + static cache + security headers + proxy :${APP_PORT})"
echo "==> key lines in $DEST:"
grep -nE "^\s*(upstream tenegta_next|Strict-Transport-Security|gzip on|location /_next/static/)" "$DEST" || true
