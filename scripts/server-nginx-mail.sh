#!/usr/bin/env bash
# Install scripts/nginx/mail.tenegta.com.conf for Mailcow on 127.0.0.1:8443
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
SRC="$REPO/scripts/nginx/mail.tenegta.com.conf"
DEST="/etc/nginx/sites-available/mail.tenegta.com"
ENABLED="/etc/nginx/sites-enabled/mail.tenegta.com"
MAILCOW_SSL="${MAILCOW_DIR:-/opt/mailcow-dockerized}/data/assets/ssl"

if [[ ! -f "$SRC" ]]; then
  echo "ERROR: missing $SRC — run git pull in $REPO"
  exit 1
fi

run() {
  if [[ "$(id -u)" -eq 0 ]]; then "$@"; else sudo "$@"; fi
}

resolve_ssl_paths() {
  local le_cert="/etc/letsencrypt/live/mail.tenegta.com/fullchain.pem"
  local le_key="/etc/letsencrypt/live/mail.tenegta.com/privkey.pem"

  if [[ -f "$le_cert" && -f "$le_key" ]]; then
    echo "$le_cert|$le_key|letsencrypt"
    return 0
  fi

  if [[ -f "$MAILCOW_SSL/cert.pem" && -f "$MAILCOW_SSL/key.pem" ]]; then
    echo "$MAILCOW_SSL/cert.pem|$MAILCOW_SSL/key.pem|mailcow"
    return 0
  fi

  return 1
}

if ! resolved="$(resolve_ssl_paths)"; then
  echo "ERROR: No SSL certificate found for mail.tenegta.com"
  echo ""
  echo "Option A — Let's Encrypt (recommended for host nginx):"
  echo "  sudo mkdir -p /var/www/certbot"
  echo "  sudo certbot certonly --webroot -w /var/www/certbot \\"
  echo "    -d mail.tenegta.com -d autodiscover.tenegta.com -d autoconfig.tenegta.com"
  echo ""
  echo "Option B — use Mailcow ACME certs (if present):"
  echo "  ls -la $MAILCOW_SSL/"
  echo ""
  echo "Then re-run: sudo bash $REPO/scripts/server-nginx-mail.sh"
  exit 1
fi

IFS='|' read -r SSL_CERT SSL_KEY SSL_SOURCE <<<"$resolved"
echo "==> using SSL from $SSL_SOURCE"
echo "    cert: $SSL_CERT"
echo "    key:  $SSL_KEY"

TMP="$(mktemp)"
sed \
  -e "s|/etc/letsencrypt/live/mail.tenegta.com/fullchain.pem|$SSL_CERT|g" \
  -e "s|/etc/letsencrypt/live/mail.tenegta.com/privkey.pem|$SSL_KEY|g" \
  "$SRC" >"$TMP"

if [[ -f "$DEST" ]]; then
  run cp -a "$DEST" "$DEST.bak.$(date +%Y%m%d%H%M%S)"
fi

run cp "$TMP" "$DEST"
rm -f "$TMP"
run ln -sf "$DEST" "$ENABLED"

echo "==> nginx -t"
if ! run nginx -t; then
  echo "ERROR: nginx test failed — disabling $ENABLED"
  run rm -f "$ENABLED"
  exit 1
fi

if run systemctl is-active --quiet nginx; then
  run systemctl reload nginx
else
  run systemctl enable nginx
  run systemctl start nginx
fi

echo "OK: mail.tenegta.com → https://127.0.0.1:8443 (SSL: $SSL_SOURCE)"
