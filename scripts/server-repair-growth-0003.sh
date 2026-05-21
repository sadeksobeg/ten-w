#!/usr/bin/env bash
# Fix Prisma drift: 0003 marked applied but Growth tables (e.g. EventNotification) missing.
# Run on VPS: bash scripts/server-repair-growth-0003.sh
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

FORCE="${1:-}"
if [ "$FORCE" != "--force" ] && node scripts/check-growth-0003.mjs 2>/dev/null; then
  echo "OK: Growth 0003 tables already present on tenegta_db."
  echo "If seed still fails, shell DATABASE_URL may override .env — use:"
  echo "  bash scripts/run-seed.sh"
  exit 0
fi

if [ "$FORCE" = "--force" ]; then
  echo "==> --force: applying idempotent SQL on tenegta_db"
  bash "$REPO/scripts/run-prisma.sh" db execute \
    --file prisma/repair/0003_idempotent.sql \
    --schema prisma/schema.prisma
  node scripts/check-growth-0003.mjs
  echo "Next: bash $REPO/scripts/run-seed.sh"
  exit 0
fi

echo "==> Drift detected: migration 0003 recorded but tables missing"
echo "==> Try re-applying migration 0003 via Prisma..."
set +e
bash "$REPO/scripts/run-prisma.sh" migrate resolve --rolled-back 0003_growth_extensions 2>&1
bash "$REPO/scripts/run-prisma.sh" migrate deploy 2>&1
set -e

if node scripts/check-growth-0003.mjs 2>/dev/null; then
  echo "OK: repaired via migrate deploy."
  exit 0
fi

echo "==> migrate deploy did not create tables — running idempotent SQL repair"
bash "$REPO/scripts/run-prisma.sh" db execute \
  --file prisma/repair/0003_idempotent.sql \
  --schema prisma/schema.prisma

if node scripts/check-growth-0003.mjs 2>/dev/null; then
  echo "OK: repaired via prisma/repair/0003_idempotent.sql"
  echo "Next: bash $REPO/scripts/run-seed.sh"
  exit 0
fi

echo "ERROR: repair failed — check DATABASE_URL in site/.env (must be tenegta_db)"
exit 1
