import type { ComponentType } from "react";
import {
  IconDeals,
  IconEarnings,
  IconLegends,
  IconMap,
  IconNetwork,
  IconTrending,
  IconVault,
  type GrowthIconProps,
} from "@/components/growth/icons/GrowthIcons";

const VAULT_ICON_MAP: Record<string, ComponentType<GrowthIconProps>> = {
  deals: IconDeals,
  network: IconNetwork,
  map: IconMap,
  streak: IconTrending,
  earnings: IconEarnings,
  legends: IconLegends,
};

export function resolveVaultIcon(slug: string | null | undefined): ComponentType<GrowthIconProps> {
  if (slug && VAULT_ICON_MAP[slug]) return VAULT_ICON_MAP[slug];
  return IconVault;
}
