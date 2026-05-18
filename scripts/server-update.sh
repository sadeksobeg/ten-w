#!/usr/bin/env bash
# Run ON THE SERVER (Hostinger hPanel -> Browser terminal / SSH in browser).
# No connection from your PC needed.
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
BRANCH="${BRANCH:-main}"
PM2_NAME="${PM2_NAME:-tenegta}"

echo "==> T.E.N.E.G.T.A server update"
echo "    repo: $REPO branch: $BRANCH"

cd "$REPO"

if [ ! -d .git ]; then
  echo "Cloning repository..."
  git clone https://github.com/sadeksobeg/ten-w.git .
fi

echo "==> git pull"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

if [ ! -f site/.env ]; then
  echo ""
  echo "ERROR: site/.env is missing."
  echo "Create it once via Hostinger File Manager:"
  echo "  Path: $REPO/site/.env"
  echo "  Copy content from site/.env.vps.example on your PC (or .env.vps.local)"
  echo "  Required: DATABASE_URL, AUTH_SECRET, AUTH_URL, NEXT_PUBLIC_SITE_URL, contact endpoint"
  echo ""
  if [ -f site/.env.vps.example ]; then
    echo "Quick start (edit secrets after):"
    echo "  cp site/.env.vps.example site/.env"
    echo "  nano site/.env"
  fi
  exit 1
fi

cd site

echo "==> npm ci"
npm ci

echo "==> check env"
npm run check:env

echo "==> prisma migrate"
npx prisma migrate deploy

echo "==> build"
npm run build

echo "==> pm2"
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME"
else
  pm2 start npm --name "$PM2_NAME" -- start
  pm2 save
fi

echo ""
echo "Deploy OK. Site should be on PORT from .env (default 3100)."
echo "  pm2 logs $PM2_NAME"
