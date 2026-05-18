#!/usr/bin/env bash
# Node 20 for TENEGTA only — uses nvm inside /var/www/tenegta/.nvm
# Does NOT upgrade system Node (other apps on the server stay untouched).
set -euo pipefail

REPO="${REPO:-/var/www/tenegta}"
export NVM_DIR="$REPO/.nvm"
NODE_VERSION="${NODE_VERSION:-20}"

if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "Installing nvm under $NVM_DIR (project-local only)..."
  mkdir -p "$NVM_DIR"
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | NVM_DIR="$NVM_DIR" bash
fi

# shellcheck source=/dev/null
source "$NVM_DIR/nvm.sh"

if ! nvm ls "$NODE_VERSION" >/dev/null 2>&1; then
  nvm install "$NODE_VERSION"
fi
nvm use "$NODE_VERSION"

echo "TENEGTA Node: $(node -v) ($(command -v node))"
echo "System Node (unchanged): $(/usr/bin/node -v 2>/dev/null || echo n/a)"
