"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { NetworkNode, NetworkStats } from "@/lib/growth/partner-network";

type Props = {
  tree: NetworkNode[];
  stats?: NetworkStats;
  locale: string;
  compact?: boolean;
  /** Admin: fetch tree on mount */
  fetchUserId?: string;
  className?: string;
};

function NodeRow({
  node,
  depth,
  locale,
  compact,
}: {
  node: NetworkNode;
  depth: number;
  locale: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children.length > 0;
  const indent = depth * (compact ? 12 : 20);

  return (
    <li className="list-none">
      <div
        className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-2 py-1.5"
        style={{ marginInlineStart: indent }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex size-5 shrink-0 items-center justify-center rounded text-[10px] text-white/50 hover:bg-white/10"
            aria-expanded={open}
          >
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className="size-5 shrink-0" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          {node.publicSlug ? (
            <Link
              href={`/growth/profile/${node.publicSlug}`}
              className="truncate text-xs font-semibold text-gold hover:underline"
            >
              {node.name}
            </Link>
          ) : (
            <span className="truncate text-xs font-semibold text-white/85">{node.name}</span>
          )}
          <span className="ms-2 text-[10px] text-white/40">
            {node.levelName} · {node.totalXp} XP
          </span>
        </div>
      </div>
      {hasChildren && open ? (
        <ul className="mt-1 space-y-1">
          {node.children.map((c) => (
            <NodeRow key={c.userId} node={c} depth={depth + 1} locale={locale} compact={compact} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function PartnerNetworkTree({
  tree: initialTree,
  stats: initialStats,
  locale,
  compact = false,
  fetchUserId,
  className = "",
}: Props) {
  const t = useTranslations("Growth.network.tree");
  const [tree, setTree] = useState(initialTree);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(Boolean(fetchUserId && !initialTree.length));

  useEffect(() => {
    if (!fetchUserId) return;
    setLoading(true);
    void fetch(
      `/api/growth/admin/partner-network?userId=${encodeURIComponent(fetchUserId)}&locale=${encodeURIComponent(locale)}`,
    )
      .then((r) => r.json())
      .then((d: { tree: NetworkNode[]; stats: NetworkStats }) => {
        setTree(d.tree ?? []);
        setStats(d.stats);
      })
      .finally(() => setLoading(false));
  }, [fetchUserId, locale]);

  if (loading) {
    return <p className={`text-xs text-white/40 ${className}`}>{t("loading")}</p>;
  }

  if (!tree.length) {
    return <p className={`text-xs text-white/45 ${className}`}>{t("empty")}</p>;
  }

  return (
    <div className={className}>
      {stats ? (
        <p className="mb-2 text-[10px] font-semibold text-white/50">
          {t("stats", {
            direct: stats.directCount,
            total: stats.totalCount,
            depth: stats.maxDepth,
          })}
        </p>
      ) : null}
      <ul className="space-y-1">
        {tree.map((n) => (
          <NodeRow key={n.userId} node={n} depth={0} locale={locale} compact={compact} />
        ))}
      </ul>
    </div>
  );
}
