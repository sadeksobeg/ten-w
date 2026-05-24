"use client";

import { useTranslations } from "next-intl";
import type { WarMapData } from "@/lib/growth/territory-service";
import type { TerritoryKey } from "@/lib/growth/territories";

type Props = {
  data: WarMapData;
  onSelect?: (key: TerritoryKey) => void;
};

function statusClass(city: WarMapData["cities"][number]): string {
  if (city.isMine) return "border-gold/50 bg-gold/15 shadow-[0_0_24px_-6px_rgba(228,184,77,0.55)]";
  if (city.isRival) return "border-rose-400/50 bg-rose-500/15 shadow-[0_0_24px_-6px_rgba(244,63,94,0.45)]";
  if (city.isUnclaimed) return "border-white/10 bg-white/[0.03] hover:border-gold/30";
  return "border-sky-400/35 bg-sky-500/10";
}

export function WarMapTerritoryGrid({ data, onSelect }: Props) {
  const t = useTranslations("Growth.map");

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden">
      {data.cities.map((city) => {
        const label = t(`territories.${city.key}`);
        const top = city.controllers.sort((a, b) => b.deals - a.deals)[0];
        const Tag = city.isUnclaimed && onSelect ? "button" : "div";

        return (
          <Tag
            key={city.key}
            type={Tag === "button" ? "button" : undefined}
            onClick={Tag === "button" ? () => onSelect!(city.key) : undefined}
            className={`rounded-xl border px-3 py-2.5 text-start transition ${statusClass(city)} ${
              Tag === "button" ? "cursor-pointer active:scale-[0.98]" : ""
            }`}
          >
            <p className="truncate text-xs font-bold text-white">{label}</p>
            <p className="mt-0.5 text-[10px] text-white/50">
              {city.isUnclaimed
                ? t("unclaimed")
                : top
                  ? `${top.name} · ${city.partnerCount}`
                  : String(city.partnerCount)}
            </p>
          </Tag>
        );
      })}
    </div>
  );
}
