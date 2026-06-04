import { getTranslations } from "next-intl/server";
import { IconGhost } from "@/components/growth/icons/GrowthIcons";
import type { GhostData } from "@/lib/growth/ghost";

type Props = { ghost: GhostData; show: boolean };

export async function GhostLeaderboardRow({ ghost, show }: Props) {
  if (!show) return null;
  const t = await getTranslations("Growth.ghost");
  return (
    <li className="growth-ghost-row flex items-center justify-between gap-3 rounded-xl border border-dashed border-violet-400/40 bg-violet-500/5 px-4 py-3 opacity-60">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-violet-300/40 bg-violet-500/10 text-violet-200">
          <IconGhost size={20} />
        </span>
        <div>
          <p className="text-sm font-bold text-violet-200">
            {t("rowTitle", { name: ghost.legendName, day: ghost.daysOnPlatform })}
          </p>
          <p className="text-xs text-white/50">
            {ghost.ghostDeals} {t("dealsShort")} · {ghost.ghostXp} XP
          </p>
        </div>
      </div>
    </li>
  );
}
