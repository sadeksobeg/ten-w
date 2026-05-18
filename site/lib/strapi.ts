import type { BlogPostCard, ProjectCard } from "./fallback-data";
import { fallbackPosts, fallbackProjects } from "./fallback-data";
import type { Locale } from "@/i18n/routing";

const STRAPI_URL = process.env.STRAPI_URL?.replace(/\/$/, "") ?? "";

type StrapiListResponse<T> = { data: T[] };

function pickLocalized(
  entry: Record<string, string> | undefined,
  locale: Locale,
): string {
  if (!entry) return "";
  return entry[locale] ?? entry.en ?? entry.ar ?? "";
}

/** Map Strapi v4 REST project entry to ProjectCard (adjust field names to your Strapi schema). */
function mapProject(
  raw: Record<string, unknown>,
  _locale: Locale,
): ProjectCard | null {
  const attrs = (raw as { attributes?: Record<string, unknown> }).attributes;
  if (!attrs) return null;
  const slug = String(attrs.slug ?? "");
  if (!slug) return null;
  const title = attrs.title as Record<string, string> | string | undefined;
  const titleObj =
    typeof title === "object" && title !== null
      ? title
      : { ar: String(title ?? ""), en: String(title ?? "") };
  return {
    slug,
    title: {
      ar: pickLocalized(titleObj as Record<string, string>, "ar") || String(titleObj),
      en: pickLocalized(titleObj as Record<string, string>, "en") || String(titleObj),
    },
    excerpt: {
      ar: String(attrs.excerpt_ar ?? attrs.excerpt ?? ""),
      en: String(attrs.excerpt_en ?? attrs.excerpt ?? ""),
    },
    challenge: {
      ar: String(attrs.challenge_ar ?? ""),
      en: String(attrs.challenge_en ?? ""),
    },
    solution: {
      ar: String(attrs.solution_ar ?? ""),
      en: String(attrs.solution_en ?? ""),
    },
    results: {
      ar: String(attrs.results_ar ?? ""),
      en: String(attrs.results_en ?? ""),
    },
    metrics: attrs.metrics_ar
      ? {
          ar: String(attrs.metrics_ar),
          en: String(attrs.metrics_en ?? attrs.metrics_ar),
        }
      : undefined,
  };
}

async function strapiFetch<T>(path: string): Promise<T | null> {
  if (!STRAPI_URL) return null;
  const token = process.env.STRAPI_API_TOKEN;
  const url = `${STRAPI_URL}/api${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getProjects(locale: Locale): Promise<ProjectCard[]> {
  const json = await strapiFetch<StrapiListResponse<Record<string, unknown>>>(
    "/projects?populate=*&sort=publishedAt:desc",
  );
  if (!json?.data?.length) {
    return fallbackProjects;
  }
  const mapped = json.data
    .map((item) => mapProject(item, locale))
    .filter(Boolean) as ProjectCard[];
  return mapped.length ? mapped : fallbackProjects;
}

export async function getProjectBySlug(
  slug: string,
  locale: Locale,
): Promise<ProjectCard | null> {
  const encoded = encodeURIComponent(slug);
  const json = await strapiFetch<StrapiListResponse<Record<string, unknown>>>(
    `/projects?filters[slug][$eq]=${encoded}&populate=*`,
  );
  const first = json?.data?.[0];
  if (!first) {
    return fallbackProjects.find((p) => p.slug === slug) ?? null;
  }
  return mapProject(first, locale);
}

function mapPost(
  raw: Record<string, unknown>,
  _locale: Locale,
): BlogPostCard | null {
  const attrs = (raw as { attributes?: Record<string, unknown> }).attributes;
  if (!attrs) return null;
  const slug = String(attrs.slug ?? "");
  if (!slug) return null;
  return {
    slug,
    title: {
      ar: String(attrs.title_ar ?? attrs.title ?? ""),
      en: String(attrs.title_en ?? attrs.title ?? ""),
    },
    excerpt: {
      ar: String(attrs.excerpt_ar ?? attrs.excerpt ?? ""),
      en: String(attrs.excerpt_en ?? attrs.excerpt ?? ""),
    },
    date: String(attrs.publishedAt ?? attrs.date ?? ""),
    body:
      attrs.body_ar || attrs.body_en
        ? {
            ar: String(attrs.body_ar ?? ""),
            en: String(attrs.body_en ?? ""),
          }
        : undefined,
  };
}

export async function getBlogPosts(locale: Locale): Promise<BlogPostCard[]> {
  void locale;
  const json = await strapiFetch<StrapiListResponse<Record<string, unknown>>>(
    "/articles?populate=*&sort=publishedAt:desc",
  );
  if (!json?.data?.length) {
    return fallbackPosts;
  }
  const mapped = json.data
    .map((item) => mapPost(item, locale))
    .filter(Boolean) as BlogPostCard[];
  return mapped.length ? mapped : fallbackPosts;
}

export async function getBlogPostBySlug(
  slug: string,
  locale: Locale,
): Promise<BlogPostCard | null> {
  void locale;
  const encoded = encodeURIComponent(slug);
  const json = await strapiFetch<StrapiListResponse<Record<string, unknown>>>(
    `/articles?filters[slug][$eq]=${encoded}&populate=*`,
  );
  const first = json?.data?.[0];
  if (!first) {
    return fallbackPosts.find((p) => p.slug === slug) ?? null;
  }
  const mapped = mapPost(first, locale);
  const fb = fallbackPosts.find((p) => p.slug === slug);
  if (mapped && fb?.body && !mapped.body) {
    return { ...mapped, body: fb.body };
  }
  return mapped;
}
