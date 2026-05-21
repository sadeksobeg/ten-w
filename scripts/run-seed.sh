#!/usr/bin/env bash
# Seed Growth data using site/.env only — never shell DATABASE_URL (e.g. clinicsaas).
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
# shellcheck source=/dev/null
source "$REPO/scripts/server-use-nvm.sh"
cd "$REPO/site"

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Clearing inherited shell DATABASE_URL before seed"
  unset DATABASE_URL
fi

npm run db:seed
