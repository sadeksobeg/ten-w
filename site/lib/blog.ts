import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import { createElement, type ReactNode } from "react";
import type { Localized } from "@/lib/fallback-data";
import { pickLocalized } from "@/lib/locale-content";
import { fallbackPosts } from "@/lib/fallback-data";
import { contentLocale } from "@/lib/locale-content";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type BlogPostMeta = {
  slug: string;
  title: Localized;
  excerpt: Localized;
  date: string;
  author: string;
  tags: string[];
  relatedCaseStudy?: string;
};

export type BlogPost = BlogPostMeta & {
  content: ReactNode;
};

function readMdxFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"));
}

export function getMdxPostSlugs(): string[] {
  const files = readMdxFiles();
  const slugs = new Set<string>();
  for (const f of files) {
    const base = f.replace(/\.(en|ar|fr)\.mdx$/, "").replace(/\.mdx$/, "");
    slugs.add(base);
  }
  return [...slugs];
}

function fileForSlug(slug: string, locale: string): string | null {
  const localized = path.join(BLOG_DIR, `${slug}.${locale}.mdx`);
  if (fs.existsSync(localized)) return localized;
  const en = path.join(BLOG_DIR, `${slug}.en.mdx`);
  if (fs.existsSync(en)) return en;
  const generic = path.join(BLOG_DIR, `${slug}.mdx`);
  if (fs.existsSync(generic)) return generic;
  return null;
}

export async function getBlogPosts(locale: string): Promise<BlogPostMeta[]> {
  const slugs = getMdxPostSlugs();
  const fromMdx: BlogPostMeta[] = [];

  for (const slug of slugs) {
    const file = fileForSlug(slug, locale);
    if (!file) continue;
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    fromMdx.push({
      slug,
      title: {
        ar: String(data.title_ar ?? data.titleAr ?? data.title ?? ""),
        en: String(data.title_en ?? data.title ?? ""),
        fr: String(data.title_fr ?? data.titleFr ?? data.title_en ?? data.title ?? ""),
      },
      excerpt: {
        ar: String(data.excerpt_ar ?? data.excerptAr ?? data.excerpt ?? ""),
        en: String(data.excerpt_en ?? data.excerpt ?? ""),
        fr: String(data.excerpt_fr ?? data.excerptFr ?? data.excerpt_en ?? data.excerpt ?? ""),
      },
      date: String(data.date ?? ""),
      author: String(data.author ?? "T.E.N.E.G.T.A"),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      relatedCaseStudy: data.relatedCaseStudy ? String(data.relatedCaseStudy) : undefined,
    });
  }

  if (fromMdx.length > 0) {
    return fromMdx.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  return fallbackPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    author: "T.E.N.E.G.T.A",
    tags: [],
  })).filter((p) => pickLocalized(p.title, locale) || p.title.en);
}

export async function getBlogPostBySlug(
  slug: string,
  locale: string,
): Promise<BlogPost | null> {
  const file = fileForSlug(slug, locale);
  if (file) {
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    const compiled = await compileMDX({
      source: content,
      options: { parseFrontmatter: false },
    });
    return {
      slug,
      title: {
        ar: String(data.title_ar ?? data.titleAr ?? data.title ?? ""),
        en: String(data.title_en ?? data.title ?? ""),
        fr: String(data.title_fr ?? data.titleFr ?? data.title_en ?? data.title ?? ""),
      },
      excerpt: {
        ar: String(data.excerpt_ar ?? data.excerptAr ?? data.excerpt ?? ""),
        en: String(data.excerpt_en ?? data.excerpt ?? ""),
        fr: String(data.excerpt_fr ?? data.excerptFr ?? data.excerpt_en ?? data.excerpt ?? ""),
      },
      date: String(data.date ?? ""),
      author: String(data.author ?? "T.E.N.E.G.T.A"),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      relatedCaseStudy: data.relatedCaseStudy ? String(data.relatedCaseStudy) : undefined,
      content: compiled.content,
    };
  }

  const cl = contentLocale(locale);
  const fb = fallbackPosts.find((p) => p.slug === slug);
  if (!fb?.body) return null;
  return {
    slug,
    title: fb.title,
    excerpt: fb.excerpt,
    date: fb.date,
    author: "T.E.N.E.G.T.A",
    tags: [],
    content: createElement(
      "div",
      { className: "prose prose-invert max-w-3xl" },
      createElement(
        "p",
        { className: "whitespace-pre-wrap text-muted" },
        fb.body[cl] ?? fb.body.en,
      ),
    ),
  };
}
