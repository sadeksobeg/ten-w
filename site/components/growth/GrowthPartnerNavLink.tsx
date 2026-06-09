"use client";

import { useEffect, useRef, useState, useTransition, type ComponentType, type ReactNode } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { GrowthIconProps } from "@/components/growth/icons/GrowthIcons";

type Props = {
  href: string;
  exact?: boolean;
  className: string;
  children: ReactNode;
  Icon?: ComponentType<GrowthIconProps>;
  iconSize?: number;
  badge?: ReactNode;
  prefetch?: boolean;
};

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href || pathname.endsWith(href);
  return pathname === href || pathname.startsWith(`${href}/`);
}

const HARD_NAV_MS = 12_000;

export function GrowthPartnerNavLink({
  href,
  exact,
  className,
  children,
  Icon,
  iconSize = 18,
  badge,
  prefetch = true,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [armed, setArmed] = useState(false);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = isActive(pathname, href, exact);
  const loading = armed && isPending;

  useEffect(() => {
    if (prefetch) router.prefetch(href);
  }, [href, prefetch, router]);

  useEffect(() => {
    if (!isPending) {
      setArmed(false);
      if (fallbackRef.current) {
        clearTimeout(fallbackRef.current);
        fallbackRef.current = null;
      }
    }
  }, [isPending, pathname]);

  useEffect(
    () => () => {
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
    },
    [],
  );

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (active || loading) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    setArmed(true);
    if (fallbackRef.current) clearTimeout(fallbackRef.current);
    fallbackRef.current = setTimeout(() => {
      window.location.assign(href);
    }, HARD_NAV_MS);
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <Link
      href={href}
      prefetch={prefetch ? true : undefined}
      aria-current={active ? "page" : undefined}
      aria-busy={loading || undefined}
      className={`${className} ${loading ? "growth-nav-link-loading pointer-events-none opacity-75" : ""}`}
      onClick={handleClick}
    >
      {loading ? (
        <span className="creator-hub-inline-spinner shrink-0" aria-hidden />
      ) : Icon ? (
        <Icon size={iconSize} className="shrink-0" />
      ) : null}
      {children}
      {badge}
    </Link>
  );
}
