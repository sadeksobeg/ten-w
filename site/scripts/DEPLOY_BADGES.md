# Badge system deploy (safe for existing partners)

**Do NOT run** `npx prisma db seed` or `FORCE_GROWTH_SEED=1` on production.

```bash
cd /var/www/tenegta
git pull origin main
bash scripts/server-update.sh
cd site
npx prisma db execute --schema=./prisma/schema.prisma --stdin < scripts/upsert-badge-definitions.sql
```

Verify: open `/ar/growth` and a public profile — locked badges show Arabic names and colored shapes (not `???` except secret badges).
