# Deploy T.E.N.E.G.T.A website on Netlify

This repository is a **monorepo**: the Next.js app (and `package.json`) is in **`site/`**. Root **`netlify.toml`** therefore includes **`base = "site"`** so Netlify runs `npm run build` there.

If you ever publish **only** the contents of `site/` as the Git root (no parent folder), remove the `base = "site"` line from `netlify.toml` and clear **Base directory** in Netlify.

## Prerequisites

- GitHub (or GitLab / Bitbucket) account  
- Netlify account  
- Node **20.x** or **22.x** (recommended; set `NODE_VERSION` in Netlify if needed)

## 1. Push the repository to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_ORG/YOUR_REPO.git
git push -u origin main
```

## 2. Create a new site on Netlify

1. Log in to [Netlify](https://app.netlify.com).
2. **Add new site** → **Import an existing project**.
3. Connect **GitHub** (or your Git provider) and select this repository.

## 3. Build settings

Netlify should read **`netlify.toml`** at the repo root automatically.

| Setting            | Value              |
|--------------------|--------------------|
| **Base directory** | *(empty in UI; `base = "site"` in `netlify.toml`)* |
| **Build command**  | `npm run build` (runs in `site/`) |
| **Publish directory** | `site/.next` (from repo root, in `netlify.toml`) |

**ENOENT `package.json` at repo root:** Netlify ran `npm run build` in `/opt/build/repo` but your app is in `site/`. Ensure **`base = "site"`** is in `netlify.toml` (as in this repo) and that the **`site/` folder is committed and pushed** to GitHub.

**Base directory does not exist:** The `site/` folder is missing from the GitHub repo — push the full monorepo or fix the folder name.

## 4. Environment variables

In Netlify: **Site configuration** → **Environment variables** → add variables from **`.env.example`** at your app root (or `site/.env.example` if the app is under `site/`).

Minimum for production:

- **`NEXT_PUBLIC_SITE_URL`** — canonical site URL, e.g. `https://your-site.netlify.app` or your custom domain (used for metadata, sitemap, JSON-LD).

Optional:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `CONTACT_WEBHOOK_URL`
- `NEXT_PUBLIC_SHOWCASE_VIDEO_URL`
- `STRAPI_URL` / `STRAPI_API_TOKEN`
- Others as documented in `.env.example` (path depends on repo layout)

Redeploy after changing environment variables.

## 5. Deploy

- **Deploy site** — Netlify runs `npm install` and `npm run build` in your base directory, then the Next.js runtime plugin serves the app.
- Custom domain: **Domain management** → add your domain and follow DNS instructions.

## 6. Local production check

From the directory that contains `package.json` (repo root or `site/`):

```bash
npm run build
npm run start
```

## Notes

- **`images.unoptimized: true`** is set in `next.config.ts` for compatibility with Netlify’s Next runtime and simpler image handling.
- This app uses the **Next.js App Router** with server features; Netlify deploys it via **`@netlify/plugin-nextjs`**, not as a pure static HTML export.
- API routes (e.g. `/api/contact`) run as Netlify Functions when deployed.

## Troubleshooting

- **Build fails**: Confirm Node version (e.g. set `NODE_VERSION=20` in Netlify environment variables).
- **Wrong base path / “Base directory does not exist”**: Ensure the **`site/`** directory exists on GitHub and matches `base = "site"`. If your repo has `package.json` at the root instead, remove `base` from `netlify.toml`.
