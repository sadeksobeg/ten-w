"use client";

import { useTranslations } from "next-intl";
import type { WeeklyChroniclePayload } from "@/lib/growth/weekly-chronicle";
import { GrowthCollapsibleSection } from "@/components/growth/ui/GrowthCollapsibleSection";

type Props = {
  locale: string;
  chronicle: WeeklyChroniclePayload;
};

export function WeeklyNewspaper({ locale, chronicle }: Props) {
  const t = useTranslations("Growth.weeklyChronicle");

  return (
    <GrowthCollapsibleSection
      title={t("sectionTitle", { range: chronicle.dateRange })}
      defaultOpen
    >
      <article className="growth-newspaper rounded-2xl border border-gold/25 bg-[#0c0e18] p-5 font-[family-name:var(--font-cairo)]">
        <header className="border-b border-gold/30 pb-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold">
            TENEGTA ASCEND WEEKLY
          </p>
          <p className="mt-1 text-xs text-white/55">
            {t("weekLine", { n: chronicle.weekNumber, range: chronicle.dateRange })}
          </p>
          <h3 className="mt-2 text-lg font-black text-white">
            {t("paperOf", { name: chronicle.partnerName })}
          </h3>
        </header>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <section>
            <h4 className="text-xs font-bold text-gold">{t("yourWeek")}</h4>
            <ul className="mt-2 space-y-1 text-sm text-white/80">
              <li>{t("closed", { n: chronicle.myWeek.dealsClosed })}</li>
              <li>{t("xp", { n: chronicle.myWeek.xpGained })}</li>
              <li>{t("checkIns", { n: chronicle.myWeek.checkInDays })}</li>
            </ul>
          </section>
          {chronicle.rivalUpdate ? (
            <section>
              <h4 className="text-xs font-bold text-gold">{t("rivalSays")}</h4>
              <p className="mt-2 text-sm text-white/80">
                {chronicle.rivalUpdate.rivalName}: {chronicle.rivalUpdate.rivalDeals}{" "}
                {t("dealsLabel")}
              </p>
              <p className="text-xs text-white/50">{chronicle.rivalUpdate.note}</p>
            </section>
          ) : null}
        </div>
        <section className="mt-4 border-t border-white/10 pt-4">
          <h4 className="text-xs font-bold text-gold">{t("oracle")}</h4>
          <p className="mt-2 text-sm italic text-white/85">«{chronicle.oracleMessage}»</p>
        </section>
        <p className="mt-3 text-xs text-white/55">{chronicle.tip}</p>
      </article>
    </GrowthCollapsibleSection>
  );
}
