#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
SITE="$REPO/site"
EXPECTED_DB="${EXPECTED_DB:-tenegta_db}"

# shellcheck source=/dev/null
source "$REPO/scripts/server-use-nvm.sh"

cd "$SITE"

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Clearing inherited shell DATABASE_URL"
  unset DATABASE_URL
fi

echo "From site/.env:"
node scripts/database-url-name.mjs

node scripts/verify-prisma-database.mjs

echo "==> prisma migrate deploy"
set +e
out="$(bash "$REPO/scripts/run-prisma.sh" migrate deploy 2>&1)"
code=$?
set -e
echo "$out"

if [ "$code" -ne 0 ]; then
  if echo "$out" | grep -q "P3005"; then
    echo ""
    echo "==> Empty-ish DB with drift — baselining 0001_init on ${EXPECTED_DB} only"
    bash "$REPO/scripts/run-prisma.sh" migrate resolve --applied 0001_init
    bash "$REPO/scripts/run-prisma.sh" migrate deploy
  elif echo "$out" | grep -q "P1001\|P1000\|ECONNREFUSED\|P1003"; then
    echo "Create database '${EXPECTED_DB}' in Hostinger PostgreSQL, then re-run."
    exit 1
  else
    echo "migrate deploy failed:"
    exit "$code"
  fi
fi

# Apply follow-up migrations (e.g. windowMs BigInt)
$RUN_PRISMA migrate deploy

if ! env -u DATABASE_URL node scripts/has-prisma-tables.mjs 2>/dev/null; then
  echo ""
  echo "==> Growth tables still missing — migrate deploy on empty ${EXPECTED_DB} required."
  echo "    Will NOT run db push automatically (protects other apps)."
  echo "    Create ${EXPECTED_DB} in Hostinger, ensure site/.env points to it, re-run."
  exit 1
fi
