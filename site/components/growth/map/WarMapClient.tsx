"use client";

import { useRouter } from "@/i18n/navigation";
import { WarMap } from "@/components/growth/map/WarMap";
import { WarMapTerritoryGrid } from "@/components/growth/map/WarMapTerritoryGrid";
import type { WarMapData } from "@/lib/growth/territory-service";
import type { TerritoryKey } from "@/lib/growth/territories";

type Props = {
  locale: string;
  data: WarMapData;
};

export function WarMapClient({ locale, data }: Props) {
  const router = useRouter();

  const goClaim = (key: TerritoryKey) => {
    router.push(`/growth/settings?territory=${key}`);
  };

  return (
    <div className="space-y-4">
      <WarMap locale={locale} data={data} onClaim={goClaim} />
      <WarMapTerritoryGrid data={data} onSelect={goClaim} />
    </div>
  );
}
