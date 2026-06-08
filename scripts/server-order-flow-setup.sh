#!/usr/bin/env bash
# Apply client-order schema (via migrate) then seed public products + discount codes.
# Safe on production — upsert/backfill only; never wipes partners.
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
SITE="$REPO/site"

# shellcheck source=/dev/null
source "$REPO/scripts/server-use-nvm.sh"

cd "$SITE"

if [ -n "${DATABASE_URL:-}" ]; then
  unset DATABASE_URL
fi

echo "==> verify order-flow schema"
if ! env -u DATABASE_URL node scripts/check-order-flow-schema.mjs 2>/dev/null; then
  echo "==> applying pending migrations (client orders / discount codes)"
  bash "$REPO/scripts/run-prisma.sh" migrate deploy
  if ! env -u DATABASE_URL node scripts/check-order-flow-schema.mjs; then
    echo "ERROR: order-flow schema still missing after migrate deploy."
    echo "       cd site && npx prisma migrate status"
    exit 1
  fi
fi

echo "==> upsert public order products"
env -u DATABASE_URL node scripts/upsert-public-order-products.mjs

echo "==> backfill client discount codes"
env -u DATABASE_URL node scripts/backfill-client-discount-codes.mjs

echo "OK: order flow ready (/order page + creator discount codes)."
