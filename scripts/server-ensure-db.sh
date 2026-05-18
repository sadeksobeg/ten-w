#!/usr/bin/env bash
# TENEGTA only: point site/.env at tenegta_db + create DB if psql is available.
# Does NOT drop or modify other databases (e.g. clinicsaas).
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
ENV_FILE="$REPO/site/.env"
LOCAL_ENV="$REPO/site/.env.local"
DB_USER="${DB_USER:-tenegta_user}"
DB_PASS="${DB_PASS:-Tenegta2025Secure}"
DB_NAME="${DB_NAME:-tenegta_db}"
TARGET_URL="postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — run server-setup-env.sh first"
  exit 1
fi

get_db_from_line() {
  local line="$1"
  line="${line#DATABASE_URL=}"
  line="${line%\"}"
  line="${line#\"}"
  line="${line%\'}"
  line="${line#\'}"
  echo "$line" | sed -E 's|.*/([^/?]+)(\?.*)?$|\1|'
}

current_db=""
if grep -qE '^DATABASE_URL=' "$ENV_FILE"; then
  db_line="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -1)"
  current_db="$(get_db_from_line "$db_line")"
fi

if [ "$current_db" != "$DB_NAME" ]; then
  echo "Fixing site/.env DATABASE_URL: was '${current_db:-<unset>}' -> ${DB_NAME}"
  if grep -qE '^DATABASE_URL=' "$ENV_FILE"; then
    sed -i.bak -E "s|^DATABASE_URL=.*|DATABASE_URL=\"${TARGET_URL}\"|" "$ENV_FILE"
  else
    echo "DATABASE_URL=\"${TARGET_URL}\"" >>"$ENV_FILE"
  fi
else
  echo "site/.env DATABASE_URL uses ${DB_NAME}"
fi

if [ -f "$LOCAL_ENV" ] && grep -qE '^DATABASE_URL=' "$LOCAL_ENV"; then
  local_line="$(grep -E '^DATABASE_URL=' "$LOCAL_ENV" | head -1)"
  local_db="$(get_db_from_line "$local_line")"
  if [ "$local_db" != "$DB_NAME" ]; then
    echo "WARNING: site/.env.local overrides DATABASE_URL with '${local_db}' — updating to ${DB_NAME}"
    sed -i.bak -E "s|^DATABASE_URL=.*|DATABASE_URL=\"${TARGET_URL}\"|" "$LOCAL_ENV"
  fi
fi

cd "$REPO/site"
resolved="$(node scripts/database-url-name.mjs 2>/dev/null || true)"
if [ -n "$resolved" ] && [ "$resolved" != "$DB_NAME" ]; then
  echo "ERROR: Prisma still resolves database '${resolved}' (expected ${DB_NAME})."
  echo "       Edit site/.env and site/.env.local manually, then re-run server-update.sh"
  exit 1
fi

if command -v psql >/dev/null 2>&1; then
  sudo -u postgres psql -v ON_ERROR_STOP=0 <<SQL || true
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL
  echo "PostgreSQL database ${DB_NAME} ready"
else
  echo "psql not found — create database '${DB_NAME}' in Hostinger (PostgreSQL) if migrate fails"
fi
