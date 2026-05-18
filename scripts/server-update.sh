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
  echo "==> site/.env missing — auto-generating..."
  bash "$REPO/scripts/server-setup-env.sh"
fi

bash "$REPO/scripts/server-ensure-node20.sh"

cd site

bash "$REPO/scripts/server-ensure-db.sh"

echo "==> npm ci"
npm ci

echo "==> check env"
npm run check:env

bash "$REPO/scripts/server-prisma.sh" "$(pwd)"

echo "==> db seed (if needed)"
npm run db:seed || echo "seed skipped or already done"

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
