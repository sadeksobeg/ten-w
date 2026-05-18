#!/usr/bin/env bash
# Run Prisma using site/.env only — never a stale shell DATABASE_URL (e.g. clinicsaas).
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
# shellcheck source=/dev/null
source "$REPO/scripts/server-use-nvm.sh"
cd "$REPO/site"

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Clearing inherited shell DATABASE_URL before Prisma"
  unset DATABASE_URL
fi

node scripts/verify-prisma-database.mjs

exec npx prisma "$@"
