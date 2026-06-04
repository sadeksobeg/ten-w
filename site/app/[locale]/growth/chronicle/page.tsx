import { getTranslations } from "next-intl/server";
import { requirePartnerDashboard } from "@/lib/growth/partner-page";
import { GrowthPageHeader } from "@/components/growth/GrowthPageHeader";
import { generateChronicle } from "@/lib/growth/chronicle";
import { ChronicleShareButton } from "@/components/growth/chronicle/ChronicleShareButton";
import { resolveChatSenderName } from "@/lib/growth/chat-display";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthChroniclePage({ params }: Props) {
  const { locale } = await params;
  const { userId, userName, userEmail } = await requirePartnerDashboard(locale);
  const t = await getTranslations("Growth.chronicle");

  const chapters = await generateChronicle(userId, locale);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      isVerifiedOfficial: true,
      officialDisplayName: true,
      partnerProfile: {
        select: { createdAt: true, currentLevel: { select: { name: true } } },
      },
    },
  });
  const name = user ? resolveChatSenderName(user) : userName;
  const joinDate = user?.partnerProfile?.createdAt;
  const milestones = chapters
    .filter((c) => !c.isOngoing)
    .slice(-3)
    .map((c) => c.highlight);

  return (
    <div className="space-y-8">
      <GrowthPageHeader title={t("title")} subtitle={t("subtitle")} />
      <header className="border-b border-gold/25 pb-6 text-center">
        <h2 className="font-[family-name:var(--font-cairo)] text-3xl font-black text-gold">
          {t("recordOf", { name })}
        </h2>
        {joinDate ? (
          <p className="mt-2 text-sm text-white/55">
            {t("memberSince", {
              date: joinDate.toLocaleDateString(
                locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US",
              ),
            })}
          </p>
        ) : null}
        <div className="mt-4 flex justify-center">
          <ChronicleShareButton
            name={name}
            levelName={user?.partnerProfile?.currentLevel.name ?? ""}
            milestones={milestones}
            locale={locale}
          />
        </div>
      </header>
      <ol className="relative space-y-8 border-s border-gold/20 ps-6">
        {chapters.map((ch) => {
          const title = locale === "ar" ? ch.titleAr : ch.titleEn;
          const body = locale === "ar" ? ch.bodyAr : ch.bodyEn;
          return (
            <li
              key={ch.number}
              className={`relative rounded-2xl border p-6 ${
                ch.isOngoing
                  ? "growth-chronicle-parchment border-gold/40 bg-[#1c1810]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <span className="absolute -start-[31px] top-6 size-3 rounded-full bg-gold" aria-hidden />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-bold text-gold">
                  {t("chapter", { n: ch.number })} — {title}
                </h3>
                <span className="text-xs text-white/50">{ch.dateRange}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/85 italic">«{body}»</p>
              {ch.isOngoing ? (
                <p className="mt-3 text-xs text-gold motion-safe:animate-pulse motion-reduce:animate-none">
                  {t("ongoing")}
                </p>
              ) : null}
              <footer className="mt-4 flex flex-wrap gap-3 border-t border-white/10 pt-3 text-xs text-white/55">
                <span>{ch.highlight}</span>
                <span>
                  {ch.dealsInPeriod} · {ch.xpGained} XP
                </span>
              </footer>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
