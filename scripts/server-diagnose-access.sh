#!/usr/bin/env bash
# Diagnose why some clients (often VPN) cannot reach tenegta.com — run on VPS.
set -euo pipefail

echo "==> nginx listening"
ss -tlnp | grep -E ':80|:443' || true

echo ""
echo "==> local HTTPS smoke"
curl -sI -o /dev/null -w "localhost: %{http_code}\n" https://127.0.0.1/ar -k --resolve tenegta.com:443:127.0.0.1 2>/dev/null || \
  curl -sI -o /dev/null -w "tenegta.com: %{http_code}\n" https://tenegta.com/ar 2>/dev/null || echo "curl failed"

echo ""
echo "==> PM2 / port 3100"
ss -tlnp | grep 3100 || true

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
