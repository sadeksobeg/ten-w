#!/usr/bin/env bash
# Deprecated: use server-use-nvm.sh (does not touch system Node).
REPO="${REPO:-/var/www/tenegta}"
exec bash "$REPO/scripts/server-use-nvm.sh"
