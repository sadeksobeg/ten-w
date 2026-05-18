#!/usr/bin/env bash
set -euo pipefail

cd "${1:-.}"

echo "==> prisma migrate deploy"
set +e
out="$(npx prisma migrate deploy 2>&1)"
code=$?
set -e
echo "$out"

if [ "$code" -eq 0 ]; then
  exit 0
fi

if echo "$out" | grep -q "P3005"; then
  echo ""
  echo "==> Database not empty — baselining migration 0001_init"
  npx prisma migrate resolve --applied 0001_init
  npx prisma migrate deploy
  exit $?
fi

if echo "$out" | grep -q "P1001\|P1000\|ECONNREFUSED"; then
  echo "Database connection failed — check DATABASE_URL in site/.env"
  exit 1
fi

echo "==> migrate deploy failed — trying prisma db push"
npx prisma db push --accept-data-loss
exit $?
