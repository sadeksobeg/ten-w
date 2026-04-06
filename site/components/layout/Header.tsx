"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

const navKeys = [
  { href: "/", key: "home" as const },
  { href: "/about", key: "about" as const },
  { href: "/solutions", key: "solutions" as const },
  { href: "/projects", key: "projects" as const },
  { href: "/pilots", key: "pilots" as const },
  { href: "/tech-stack", key: "techStack" as const },
  { href: "/team", key: "team" as const },
  { href: "/investors", key: "investors" as const },
  { href: "/blog", key: "blog" as const },
  { href: "/contact", key: "contact" as const },
] as const;

export function Header() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-cairo)] text-lg font-bold tracking-tight text-gold"
        >
          T.E.N.E.G.T.A
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex lg:flex-wrap lg:justify-end"
          aria-label="Main"
        >
          {navKeys.map(({ href, key }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={key}
                href={href}
                className={`rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-gold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t(key)}
              </Link>
            );
          })}
          <div className="ms-2 border-s border-white/10 ps-3">
            <LocaleSwitcher />
          </div>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <LocaleSwitcher />
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-white/15 text-foreground"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">
              {open ? t("closeMenu") : t("openMenu")}
            </span>
            <span aria-hidden className="text-xl">
              {open ? "×" : "≡"}
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-white/10 bg-bg lg:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3" aria-label="Mobile">
            {navKeys.map(({ href, key }) => (
              <Link
                key={key}
                href={href}
                className="min-h-11 py-2 text-sm font-medium text-foreground"
                onClick={() => setOpen(false)}
              >
                {t(key)}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
