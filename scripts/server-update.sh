#!/usr/bin/env bash
# Run ON THE SERVER (Hostinger hPanel -> Browser terminal / SSH in browser).
# No connection from your PC needed.
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
BRANCH="${BRANCH:-main}"
PM2_NAME="${PM2_NAME:-tenegta}"

echo "==> T.E.N.E.G.T.A server update (isolated — does not touch other apps)"
echo "    repo: $REPO branch: $BRANCH port: 3100 db: tenegta_db pm2: $PM2_NAME"

cd "$REPO"

if [ -n "${DATABASE_URL:-}" ]; then
  echo "WARNING: shell DATABASE_URL is set — unsetting so site/.env is used (avoids hitting clinicsaas)"
  unset DATABASE_URL
fi

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

# Node 20 in $REPO/.nvm only — system Node for other projects unchanged
# shellcheck source=/dev/null
source "$REPO/scripts/server-use-nvm.sh"

cd site

bash "$REPO/scripts/server-ensure-db.sh"

echo "==> npm ci"
npm ci

echo "==> check env"
npm run check:env

bash "$REPO/scripts/server-prisma.sh"

echo "==> db seed (if needed)"
if env -u DATABASE_URL node scripts/has-prisma-tables.mjs 2>/dev/null; then
  env -u DATABASE_URL npm run db:seed || echo "seed skipped or already done"
else
  echo "seed skipped — schema not ready"
fi

echo "==> build"
npm run build

echo "==> pm2 (process name: $PM2_NAME only)"
if [ ! -d .next ]; then
  echo "ERROR: build missing (.next). Build step may have been skipped."
  exit 1
fi
bash "$REPO/scripts/server-restart.sh"

PORT="$(grep -E '^PORT=' .env 2>/dev/null | head -1 | cut -d= -f2 | tr -d '"' || echo 3100)"
echo ""
echo "==> smoke test (port $PORT)"
sleep 2
if curl -fsS -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/en" | grep -qE '200|307|308'; then
  echo "OK: Next.js responding on http://127.0.0.1:${PORT}/en"
else
  echo "WARNING: No Next.js on port ${PORT}. Check: bash scripts/server-pm2.sh logs $PM2_NAME"
  echo "         What listens: ss -tlnp | grep ${PORT}"
fi

echo ""
echo "Deploy OK. Site on PORT $PORT (from site/.env)."
echo "  bash scripts/server-pm2.sh logs $PM2_NAME"
echo "  bash scripts/server-pm2.sh status"
