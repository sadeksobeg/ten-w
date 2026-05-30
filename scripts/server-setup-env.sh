#!/usr/bin/env bash
# Auto-generate site/.env on the server (no nano, no copy from PC).
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
ENV_FILE="${ENV_FILE:-$REPO/site/.env}"
CREDS_FILE="${CREDS_FILE:-$REPO/scripts/server-generated-credentials.txt}"
DOMAIN="${DOMAIN:-tenegta.com}"
PORT="${PORT:-3100}"
DATABASE_URL="${DATABASE_URL:-postgresql://tenegta_user:Tenegta2025Secure@127.0.0.1:5432/tenegta_db}"

if [ -f "$ENV_FILE" ] && [ "${FORCE_ENV:-0}" != "1" ]; then
  echo "site/.env already exists — skip (set FORCE_ENV=1 to overwrite)"
  exit 0
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "openssl is required"
  exit 1
fi

AUTH_SECRET="$(openssl rand -base64 32)"
GROWTH_ADMIN="$(openssl rand -hex 16)"
GROWTH_DEMO="$(openssl rand -hex 16)"
ORIGIN="https://${DOMAIN//https:\/\//}"
ORIGIN="${ORIGIN%/}"

mkdir -p "$(dirname "$ENV_FILE")"
mkdir -p "$(dirname "$CREDS_FILE")"

cat >"$ENV_FILE" <<EOF
# AUTO-GENERATED on server by scripts/server-setup-env.sh
# $(date -u +"%Y-%m-%dT%H:%M:%SZ")

NODE_ENV=production
PORT=$PORT

DATABASE_URL="$DATABASE_URL"

AUTH_SECRET="$AUTH_SECRET"

AUTH_URL="$ORIGIN"
NEXT_PUBLIC_SITE_URL="$ORIGIN"

CONTACT_WEBHOOK_URL="https://httpbin.org/post"

GROWTH_ADMIN_PASSWORD="$GROWTH_ADMIN"
GROWTH_DEMO_PASSWORD="$GROWTH_DEMO"

NEXT_PUBLIC_CONTACT_PHONE_RAW="+963939448113"
NEXT_PUBLIC_CONTACT_PHONE_DISPLAY="+963 939 448 113"
NEXT_PUBLIC_WHATSAPP_E164="+963939448113"
EOF

chmod 600 "$ENV_FILE"

cat >"$CREDS_FILE" <<EOF
T.E.N.E.G.T.A — server credentials ($(date -u +"%Y-%m-%d %H:%M UTC"))
============================================================
Site: $ORIGIN
Env file: $ENV_FILE

AUTH_SECRET=$AUTH_SECRET
Growth admin password: $GROWTH_ADMIN
Growth demo password:  $GROWTH_DEMO

Contact: httpbin (test only) — add Formspree later in site/.env
EOF
chmod 600 "$CREDS_FILE"

echo "Created $ENV_FILE"
echo "Passwords saved to $CREDS_FILE"
echo "  cat $CREDS_FILE"
