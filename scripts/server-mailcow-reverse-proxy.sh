#!/usr/bin/env bash
# Fix Mailcow binding so host nginx can use 80/443 for tenegta.com.
# Run on VPS as root: bash /var/www/tenegta/scripts/server-mailcow-reverse-proxy.sh
set -euo pipefail

MAILCOW_DIR="${MAILCOW_DIR:-/opt/mailcow-dockerized}"
CONF="$MAILCOW_DIR/mailcow.conf"

if [[ ! -f "$CONF" ]]; then
  echo "ERROR: $CONF not found. Set MAILCOW_DIR if Mailcow is elsewhere."
  exit 1
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "ERROR: run as root (or with sudo)"
  exit 1
fi

BACKUP="$CONF.bak.$(date +%Y%m%d%H%M%S)"
cp -a "$CONF" "$BACKUP"
echo "==> backed up to $BACKUP"

# Comment duplicate public bindings (last wins in mailcow.conf — these override 8080/8443)
for pattern in '^HTTP_PORT=80$' '^HTTPS_PORT=443$' '^HTTP_BIND=$' '^HTTPS_BIND=$'; do
  if grep -qE "$pattern" "$CONF"; then
    sed -i -E "s/${pattern}/# &/" "$CONF"
    echo "==> commented lines matching: $pattern"
  fi
done

ensure_kv() {
  local key="$1"
  local val="$2"
  if grep -qE "^${key}=" "$CONF"; then
    sed -i -E "s|^${key}=.*|${key}=${val}|" "$CONF"
  else
    printf '\n%s=%s\n' "$key" "$val" >>"$CONF"
  fi
}

ensure_kv HTTP_PORT 8080
ensure_kv HTTPS_PORT 8443
ensure_kv HTTP_BIND 127.0.0.1
ensure_kv HTTPS_BIND 127.0.0.1

echo ""
echo "==> HTTP/S settings now:"
grep -E '^#?HTTP_|^#?HTTPS_' "$CONF" || true

echo ""
echo "==> restarting Mailcow (this may take 1–2 min)..."
cd "$MAILCOW_DIR"
docker compose down
docker compose up -d

echo ""
echo "==> waiting for containers..."
sleep 20

echo "==> listeners:"
ss -tlnp | grep -E ':443|:80|:8080|:8443' || true

if ss -tlnp | grep -q '0.0.0.0:443.*docker-proxy'; then
  echo ""
  echo "WARNING: docker still on 0.0.0.0:443 — check for more duplicate HTTP_* lines in $CONF"
  exit 1
fi

echo ""
echo "OK: Mailcow should be on 127.0.0.1:8080 and 127.0.0.1:8443"
echo "Next:"
echo "  cd /var/www/tenegta && sudo bash scripts/server-nginx-tenegta.sh"
echo "  sudo bash scripts/server-nginx-mail.sh   # mail.tenegta.com → Mailcow"
echo "  sudo systemctl start nginx"
