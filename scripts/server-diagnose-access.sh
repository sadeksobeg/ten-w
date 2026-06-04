#!/usr/bin/env bash
# Diagnose why some clients (often VPN) cannot reach tenegta.com — run on VPS.
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
APP_PORT="$(grep -E '^PORT=' "$REPO/site/.env" 2>/dev/null | head -1 | cut -d= -f2 | tr -d '"' || echo 3100)"

echo "==> nginx listening"
ss -tlnp | grep -E ':80|:443' || true

echo ""
echo "==> local HTTPS smoke (tenegta.com → nginx → app)"
curl -sI -o /dev/null -w "https://tenegta.com/ar: %{http_code}\n" \
  -H "Host: tenegta.com" https://127.0.0.1/ar -k --resolve tenegta.com:443:127.0.0.1 2>/dev/null || \
  curl -sI -o /dev/null -w "https://tenegta.com/ar: %{http_code}\n" https://tenegta.com/ar 2>/dev/null || \
  echo "curl failed"

echo ""
echo "==> app PORT from site/.env: ${APP_PORT}"
echo "==> nginx upstream (sites-enabled only):"
grep -Rhn "127.0.0.1:310" /etc/nginx/sites-enabled/ 2>/dev/null | grep -v ".bak" || true
NGINX_PORT="$(grep -Rho "127.0.0.1:310[0-9]" /etc/nginx/sites-enabled/tenegta.com 2>/dev/null | head -1 | cut -d: -f2 || true)"
if [ -n "$NGINX_PORT" ] && [ "$NGINX_PORT" != "$APP_PORT" ]; then
  echo "WARNING: nginx upstream :${NGINX_PORT} ≠ site/.env PORT=${APP_PORT}"
  echo "         Run: bash $REPO/scripts/server-nginx-tenegta.sh"
fi

echo ""
echo "==> PM2 / app port"
ss -tlnp | grep -E '3100|3101' || true
for alt in 3100 3101; do
  if [ "$alt" = "$APP_PORT" ]; then continue; fi
  if ! ss -tlnp 2>/dev/null | grep -q ":${alt} "; then continue; fi
  pid="$(ss -tlnp 2>/dev/null | grep ":${alt} " | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -1)"
  cwd="$(readlink -f "/proc/${pid}/cwd" 2>/dev/null || echo unknown)"
  echo "Note: :${alt} in use by pid ${pid} (${cwd}) — not tenegta; do not kill unless you know this service"
done
pm2 list 2>/dev/null | head -20 || true

echo ""
echo "==> UFW (if installed)"
if command -v ufw >/dev/null 2>&1; then
  ufw status verbose 2>/dev/null || true
else
  echo "ufw not installed"
fi

echo ""
echo "==> fail2ban (if installed)"
if command -v fail2ban-client >/dev/null 2>&1; then
  fail2ban-client status 2>/dev/null || true
else
  echo "fail2ban not installed"
fi

echo ""
echo "==> recent nginx errors (last 15)"
tail -15 /var/log/nginx/error.log 2>/dev/null || echo "no nginx error log access"

echo ""
echo "Tip: Hostinger hPanel → Security → Firewall — allow 80/443 worldwide."
echo "     VPN exit IPs are often datacenter ranges; geo-block or fail2ban may block them."
echo "     Shared VPS: :3100 may be clinic-os whatsapp-bridge — tenegta uses site/.env PORT (often 3101)."
