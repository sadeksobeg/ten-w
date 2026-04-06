# Deploy T.E.N.E.G.T.A website on Netlify

**بدون GitHub — رفع من الجهاز فقط:** راجع **[DEPLOY-WITHOUT-GIT.md](./DEPLOY-WITHOUT-GIT.md)** (Netlify CLI بعد `npm run build`).

---

Locally you can use **npm workspaces**: a root **`package.json`** may declare `"workspaces": ["site"]` for `npm run build` from the repo root.

**Netlify** is configured with **`base = "site"`** in **`netlify.toml`**, so **`npm install`** and **`npm run build`** run **inside `site/`**, where the app’s **`package.json`** lives. That avoids **`ENOENT … /opt/build/repo/package.json`** when the Git remote does not include a root `package.json` (or only `site/` was connected).

Build output is **`site/.next`**; **`publish`** in `netlify.toml` points there (from the repo root).

**You must push the repo including the `site/` folder** (and keep **`netlify.toml`** at the repo root). A root **`package.json`** / **`package-lock.json`** is optional for Netlify but still useful for local monorepo commands.

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
| **Base directory** | *(empty in UI — let `netlify.toml` set `base = "site"`)* |
| **Build command**  | `npm run build` (runs in `site/` because of `base`) |
| **Publish directory** | `site/.next` (set in `netlify.toml`; do not override to `.next` only unless you change layout) |

**“Base directory does not exist: …/site”:** The Git remote has no **`site/`** folder. Commit and push **`site/`**, or fix the connected repo path.

**“Could not read package.json” at repo root (`/opt/build/repo/package.json`):** Netlify was running the build at the repo root without a root `package.json`. This project’s **`netlify.toml`** uses **`base = "site"`** so npm runs in **`site/`**. Clear any Netlify UI override that forces an empty base while the repo also lacks root `package.json`. If you prefer building from the root instead, add and push the root **`package.json`** (workspaces) and **`package-lock.json`**, and remove **`base = "site"`** from `netlify.toml`.

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

## Alternative: Next.js app is the Git repository root (no `site/` folder)

If you publish **only** the contents of `site/` so that **`package.json` is at the repo root** on GitHub:

- Remove the root **`package.json`** workspaces file (or do not commit it).
- Use **`netlify.toml`** with `publish = ".next"` and **no** `site/` prefix:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Troubleshooting

- **Build fails**: Confirm Node version (e.g. set `NODE_VERSION=20` in Netlify environment variables).
- **“Base directory does not exist: …/site”**: The remote must contain a **`site/`** directory matching this layout. Do not set a different base in the Netlify UI than in `netlify.toml`.
- **`site/` missing on GitHub**: Commit and push the **`site/`** directory (full monorepo layout).
