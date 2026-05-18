#!/usr/bin/env bash
# TENEGTA only: creates tenegta_db + tenegta_user if missing.
# Does NOT drop or modify other databases (e.g. clinicsaas).
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
ENV_FILE="$REPO/site/.env"
DB_USER="${DB_USER:-tenegta_user}"
DB_PASS="${DB_PASS:-Tenegta2025Secure}"
DB_NAME="${DB_NAME:-tenegta_db}"
TARGET_URL="postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — run server-setup-env.sh first"
  exit 1
fi

if grep -q "DATABASE_URL=" "$ENV_FILE"; then
  if ! grep -q "/${DB_NAME}?" "$ENV_FILE" && ! grep -q "/${DB_NAME}\"" "$ENV_FILE"; then
    echo "Updating site/.env only -> DATABASE_URL uses ${DB_NAME} (not your other app's DB)"
    sed -i.bak -E "s|^DATABASE_URL=.*|DATABASE_URL=\"${TARGET_URL}\"|" "$ENV_FILE"
  else
    echo "DATABASE_URL already uses ${DB_NAME}"
  fi
else
  echo "DATABASE_URL=\"${TARGET_URL}\"" >>"$ENV_FILE"
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
  echo "psql not found — create database ${DB_NAME} manually if migrate fails"
fi
