#!/usr/bin/env bash
# Quick SEO smoke checks (run on VPS after deploy).
set -euo pipefail

ORIGIN="${ORIGIN:-https://tenegta.com}"

echo "==> 301 root -> /ar"
curl -sI "${ORIGIN}/" | grep -iE '^HTTP|^location' || true

echo ""
echo "==> 301 www -> apex"
curl -sI "https://www.tenegta.com/ar" | grep -iE '^HTTP|^location' || true

echo ""
echo "==> canonical + hreflang on /ar (first 8)"
curl -s "${ORIGIN}/ar" | grep -ioE '<link[^>]+rel="(canonical|alternate)"[^>]*>' | head -8 || true

echo ""
echo "==> JSON-LD blocks on /ar"
curl -s "${ORIGIN}/ar" | grep -c 'application/ld+json' || true

echo ""
echo "==> sitemap cluster sample"
curl -s "${ORIGIN}/sitemap.xml" | head -30

echo ""
echo "Done. Submit ${ORIGIN}/sitemap.xml in Google Search Console if not already."
