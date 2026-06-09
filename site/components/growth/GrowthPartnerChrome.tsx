import type { ReactNode } from "react";
import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensurePartnerProfile } from "@/lib/growth/ensure-partner-profile";
import { resolveLevelName } from "@/lib/growth/level-i18n";
import { GrowthPartnerHeader } from "@/components/growth/GrowthPartnerHeader";
import { GrowthPartnerShell } from "@/components/growth/GrowthPartnerShell";
import { PartnerChatBubble } from "@/components/growth/chat/PartnerChatBubble";
import { CommandPalette } from "@/components/growth/CommandPalette";
import { canAccessCreatorLounge } from "@/lib/growth/creator-program";

type Props = {
  locale: string;
  children: ReactNode;
};

export async function GrowthPartnerChrome({ locale, children }: Props) {
  const session = await auth();
  if (!session?.user?.id) return <>{children}</>;

  const [user, profile, earnedBadgeRows, showCreatorsProgram] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, avatarUrl: true, publicSlug: true },
    }),
    ensurePartnerProfile(session.user.id),
    prisma.userBadge.findMany({
      where: { userId: session.user.id },
      select: { badge: { select: { key: true } } },
    }),
    canAccessCreatorLounge(session.user.id),
  ]);

  const earnedBadgeKeys = earnedBadgeRows.map((r) => r.badge.key);

  const levelName =
    profile?.currentLevel != null
      ? resolveLevelName(profile.currentLevel.name, locale)
      : "—";

  return (
    <GrowthPartnerShell
      locale={locale}
      showCreatorsProgram={showCreatorsProgram}
      header={
        <GrowthPartnerHeader
          locale={locale}
          name={user?.name ?? null}
          email={user?.email ?? session.user.email ?? ""}
          avatarUrl={user?.avatarUrl ?? session.user.image ?? null}
          levelName={levelName}
          publicSlug={user?.publicSlug ?? null}
          earnedBadgeKeys={earnedBadgeKeys}
        />
      }
    >
      {children}
      <CommandPalette />
      <Suspense fallback={null}>
        <PartnerChatBubble locale={locale} viewerUserId={session.user.id} />
      </Suspense>
    </GrowthPartnerShell>
  );
}
