"use client";

import { useRouter } from "@/i18n/navigation";
import { WarMap } from "@/components/growth/map/WarMap";
import type { WarMapData } from "@/lib/growth/territory-service";
import type { TerritoryKey } from "@/lib/growth/territories";

type Props = {
  locale: string;
  data: WarMapData;
};

export function WarMapClient({ locale, data }: Props) {
  const router = useRouter();

  return (
    <WarMap
      locale={locale}
      data={data}
      onClaim={(key: TerritoryKey) => {
        router.push(`/growth/settings?territory=${key}`);
      }}
    />
  );
}
