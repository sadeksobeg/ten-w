# Strapi (headless CMS) — content model

Point `STRAPI_URL` and `STRAPI_API_TOKEN` at your Strapi 4.x instance. The Next.js app expects REST collections with roughly the following fields (adjust `lib/strapi.ts` if your API differs).

## Collection: `projects`

| Field | Type |
|-------|------|
| `slug` | UID |
| `title` | String (or localized Component) |
| `title_ar`, `title_en` | String (if not using localization plugin) |
| `excerpt`, `excerpt_ar`, `excerpt_en` | Text |
| `challenge_ar`, `challenge_en` | Rich text / Text |
| `solution_ar`, `solution_en` | Rich text / Text |
| `results_ar`, `results_en` | Rich text / Text |
| `metrics_ar`, `metrics_en` | String (optional) |
| `publishedAt` | DateTime |

Permissions: enable `find` and `findOne` for Public (or use API token).

## Collection: `articles` (blog)

| Field | Type |
|-------|------|
| `slug` | UID |
| `title_ar`, `title_en` | String |
| `excerpt_ar`, `excerpt_en` | Text |
| `body_ar`, `body_en` | Rich text |
| `publishedAt` | DateTime |

## Optional later

- `team-members`, `job-openings`, `legal-pages` — mirror the fallback structures in `lib/fallback-data.ts` and extend `lib/strapi.ts`.

Upload media to Strapi; add your media domain to `next.config.ts` under `images.remotePatterns`.
