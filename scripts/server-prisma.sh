#!/usr/bin/env bash
set -euo pipefail

cd "${1:-.}"
EXPECTED_DB="${EXPECTED_DB:-tenegta_db}"

resolved="$(node scripts/database-url-name.mjs)"
echo "Prisma target database: $resolved"
if [ "$resolved" != "$EXPECTED_DB" ]; then
  echo "ERROR: DATABASE_URL must use database '${EXPECTED_DB}', not '${resolved}'."
  echo "       Run: bash scripts/server-ensure-db.sh"
  exit 1
fi

echo "==> prisma migrate deploy"
set +e
out="$(npx prisma migrate deploy 2>&1)"
code=$?
set -e
echo "$out"

if [ "$code" -ne 0 ]; then
  if echo "$out" | grep -q "P3005"; then
    echo ""
    echo "==> Database not empty — baselining migration 0001_init"
    npx prisma migrate resolve --applied 0001_init
    npx prisma migrate deploy
  elif echo "$out" | grep -q "P1001\|P1000\|ECONNREFUSED\|P1003"; then
    echo "Database connection failed — create ${EXPECTED_DB} in Hostinger PostgreSQL, then re-run."
    exit 1
  else
    echo "==> migrate deploy failed — trying prisma db push"
    npx prisma db push --accept-data-loss
  fi
fi

if ! node scripts/has-prisma-tables.mjs 2>/dev/null; then
  echo ""
  echo "==> Growth tables missing on ${EXPECTED_DB} — applying schema (db push)"
  npx prisma db push --accept-data-loss
  if ! node scripts/has-prisma-tables.mjs 2>/dev/null; then
    echo "ERROR: Schema still missing after db push. Check DATABASE_URL and database permissions."
    exit 1
  fi
  echo "Schema applied on ${EXPECTED_DB}"
fi
