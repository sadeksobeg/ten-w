T.E.N.E.G.T.A — Netlify deployment bundle (reference copy)
============================================================

This folder is a convenience copy of deployment files for upload or archiving.
The live project must include the full repository, especially the `site/` Next.js app.

Contents:
  - netlify.toml     → copy to repository ROOT (same level as `site/`)
  - DEPLOY.md        → deployment instructions (copy to repository ROOT)
  - env.example.txt  → mirrors site/.env.example (set variables in Netlify UI)

Do NOT deploy only this folder. Push the whole repo to GitHub and connect Netlify to it.

Default netlify.toml has NO `base` — use when package.json is at repo root.

If your repo is a monorepo (TENEGTA-WEBSITE/site/package.json), set Base directory
to `site` in Netlify UI or add base = "site" under [build] in netlify.toml.
