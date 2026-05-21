#!/usr/bin/env bash
# Set Growth admin password on tenegta_db (site/.env only).
# Usage: bash scripts/set-admin-password.sh 'MyStrongPassword123'
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
# shellcheck source=/dev/null
source "$REPO/scripts/server-use-nvm.sh"
cd "$REPO/site"

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Clearing inherited shell DATABASE_URL"
  unset DATABASE_URL
fi

node scripts/verify-prisma-database.mjs
node scripts/set-growth-admin-password.mjs "${1:-}"
