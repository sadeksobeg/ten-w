#!/usr/bin/env bash
set -euo pipefail

need_major=20
current="$(node -v 2>/dev/null | sed 's/^v//' | cut -d. -f1 || echo 0)"

if [ "$current" -ge "$need_major" ] 2>/dev/null; then
  echo "Node OK: $(node -v)"
  exit 0
fi

echo "Node $(node -v 2>/dev/null || echo missing) — installing Node 20..."

if command -v apt-get >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
elif command -v dnf >/dev/null 2>&1; then
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  dnf install -y nodejs
else
  echo "Install Node 20 manually, then re-run server-update.sh"
  exit 1
fi

echo "Node now: $(node -v)"
