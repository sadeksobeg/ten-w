import campaignsJson from "@/data/ascend-campaigns.json";
import { prisma } from "@/lib/prisma";
import { EventStatus } from "@prisma/client";

export type AscendCampaignTheme =
  | "gold_command"
  | "nebula_vault"
  | "constellation"
  | "territory_atlas"
  | "chronicle"
  | "capsule_seal"
  | "event_launch";

export type AscendCampaignType =
  | "event_launch"
  | "feature_drop"
  | "season"
  | "admin_broadcast"
  | "partner_milestone";

export type LocalizedText = { ar: string; en: string; fr: string };

export type AscendCampaign = {
  id: string;
  type: AscendCampaignType;
  theme: AscendCampaignTheme;
  priority: number;
  startsAt: string;
  endsAt: string;
  title: LocalizedText;
  body: LocalizedText;
  ctaLabel: LocalizedText;
  ctaHref: string;
  badgePreviewKey?: string;
  eventSlug?: string;
};

const STATIC = campaignsJson as AscendCampaign[];

function inWindow(c: AscendCampaign, now: Date): boolean {
  return now >= new Date(c.startsAt) && now <= new Date(c.endsAt);
}

export function campaignText(
  map: LocalizedText,
  locale: string,
): string {
  if (locale === "ar") return map.ar;
  if (locale === "fr") return map.fr;
  return map.en;
}

/** Active static campaigns + live growth events (neutral copy — no war wording). */
export async function getActiveAscendCampaigns(
  locale: string,
  limit = 2,
): Promise<AscendCampaign[]> {
  const now = new Date();
  const fromStatic = STATIC.filter((c) => inWindow(c, now));

  let fromEvents: AscendCampaign[] = [];
  try {
    const events = await prisma.growthEvent.findMany({
      where: {
        status: { in: [EventStatus.PUBLISHED, EventStatus.ACTIVE] },
        startAt: { lte: now },
        OR: [{ endAt: null }, { endAt: { gte: now } }],
      },
      orderBy: { startAt: "desc" },
      take: 3,
      select: {
        slug: true,
        title: true,
        description: true,
        startAt: true,
        endAt: true,
      },
    });

    fromEvents = events.map((e, i) => ({
      id: `event-${e.slug}`,
      type: "event_launch",
      theme: "event_launch",
      priority: 90 - i,
      startsAt: e.startAt.toISOString(),
      endsAt: (e.endAt ?? new Date(now.getTime() + 90 * 86400000)).toISOString(),
      title: { ar: e.title, en: e.title, fr: e.title },
      body: {
        ar: e.description.slice(0, 220),
        en: e.description.slice(0, 220),
        fr: e.description.slice(0, 220),
      },
      ctaLabel: {
        ar: "انضم للفعالية",
        en: "Join the event",
        fr: "Rejoindre l'événement",
      },
      ctaHref: `/growth/events/${e.slug}`,
      eventSlug: e.slug,
    }));
  } catch {
    fromEvents = [];
  }

  return [...fromEvents, ...fromStatic]
    .filter((c) => inWindow(c, now))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}
