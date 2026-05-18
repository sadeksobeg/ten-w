#!/usr/bin/env bash
# Same as deploy-vps.ps1 — for Git Bash / macOS / Linux
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CONFIG="$ROOT/scripts/deploy-vps.config.json"
ENV_LOCAL="$ROOT/site/.env.vps.local"

if [[ ! -f "$CONFIG" ]]; then
  echo "Missing scripts/deploy-vps.config.json"
  echo "  cp scripts/deploy-vps.config.example.json scripts/deploy-vps.config.json"
  exit 1
fi

if [[ ! -f "$ENV_LOCAL" ]]; then
  echo "Missing site/.env.vps.local"
  echo "  cp site/.env.vps.example site/.env.vps.local"
  exit 1
fi

HOST=$(node -e "console.log(require('$CONFIG').host)")
USER=$(node -e "console.log(require('$CONFIG').user)")
PORT=$(node -e "console.log(require('$CONFIG').port||22)")
REMOTE=$(node -e "console.log(require('$CONFIG').remotePath)")
BRANCH=$(node -e "console.log(require('$CONFIG').branch||'main')")
PM2=$(node -e "console.log(require('$CONFIG').pm2Name||'tenegta')")
GIT_REMOTE=$(node -e "console.log(require('$CONFIG').gitRemote||'origin')")

TARGET="${USER}@${HOST}"

echo "==> Push to GitHub (ten-w)..."
git push ten-w "$BRANCH" || true

echo "==> Upload .env..."
scp -P "$PORT" "$ENV_LOCAL" "${TARGET}:${REMOTE}/site/.env"

echo "==> Remote build & restart..."
ssh -p "$PORT" "$TARGET" bash -s <<EOF
set -e
cd '$REMOTE'
git fetch $GIT_REMOTE
git checkout $BRANCH
git pull $GIT_REMOTE $BRANCH
cd site
npm ci
npm run check:env
npx prisma migrate deploy
npm run build
if pm2 describe $PM2 >/dev/null 2>&1; then
  pm2 restart $PM2
else
  pm2 start npm --name $PM2 -- start
  pm2 save
fi
echo "Deploy OK"
EOF

echo "Done. Check: https://tenegta.com"
