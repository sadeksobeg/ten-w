#!/usr/bin/env bash
# Diagnose why some clients (often VPN) cannot reach tenegta.com — run on VPS.
set -euo pipefail

echo "==> nginx listening"
ss -tlnp | grep -E ':80|:443' || true

echo ""
echo "==> local HTTPS smoke (tenegta.com → nginx → app)"
curl -sI -o /dev/null -w "https://tenegta.com/ar: %{http_code}\n" \
  -H "Host: tenegta.com" https://127.0.0.1/ar -k --resolve tenegta.com:443:127.0.0.1 2>/dev/null || \
  curl -sI -o /dev/null -w "https://tenegta.com/ar: %{http_code}\n" https://tenegta.com/ar 2>/dev/null || \
  echo "curl failed"

echo ""
echo "==> nginx upstream ports (3100 = TENEGTA app in repo; 3101 = wrong if nothing listens)"
grep -Rhn "127.0.0.1:310" /etc/nginx/sites-enabled/ /etc/nginx/sites-available/ 2>/dev/null | grep -v ".bak" || true
if grep -Rq "127.0.0.1:3101" /etc/nginx/sites-enabled/ /etc/nginx/sites-available/ 2>/dev/null; then
  echo "WARNING: nginx proxies to :3101 but PM2 usually runs on :3100 — run: bash scripts/server-nginx-tenegta.sh"
fi

echo ""
echo "==> PM2 / app port"
ss -tlnp | grep -E '3100|3101' || true
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
