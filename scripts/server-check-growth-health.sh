#!/usr/bin/env bash
# Run on VPS after git pull to diagnose Growth admin errors.
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
SITE="$REPO/site"

# shellcheck source=/dev/null
source "$REPO/scripts/server-use-nvm.sh"

cd "$SITE"

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Clearing inherited shell DATABASE_URL"
  unset DATABASE_URL
fi

node scripts/verify-prisma-database.mjs
node scripts/check-growth-0003.mjs
node scripts/check-growth-health.mjs
