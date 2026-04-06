export type DemoScenarioId =
  | "ops"
  | "security"
  | "production"
  | "precisionAg"
  | "services";

export const DEMO_SCENARIO_IDS: DemoScenarioId[] = [
  "ops",
  "security",
  "production",
  "precisionAg",
  "services",
];

export function parseScenarioParam(
  value: string | null,
): DemoScenarioId | null {
  if (!value) return null;
  return DEMO_SCENARIO_IDS.includes(value as DemoScenarioId)
    ? (value as DemoScenarioId)
    : null;
}

export function mockRecommendation(
  scenario: DemoScenarioId,
  dataHint: string,
  goalHint: string,
  locale: "ar" | "en",
): string {
  const dh = dataHint.trim().slice(0, 80);
  const gh = goalHint.trim().slice(0, 80);

  const lines: Record<DemoScenarioId, { ar: string; en: string }> = {
    ops: {
      ar: `مثال توضيحي: ركّز على توحيد مؤشرات التشغيل عبر الأنظمة، وجدولة تنبيهات SLA، وربط لوحة قيادة واحدة للفرق (${dh || "بياناتك"} → ${gh || "هدفك"}).`,
      en: `Illustrative example: unify operational KPIs across systems, schedule SLA alerts, and tie them to one dashboard for teams (${dh || "your data"} → ${gh || "your goal"}).`,
    },
    security: {
      ar: `مثال توضيحي: اعتمد جمع السجلات من المصادر الحرجة، اكتشافاً مبنياً على القواعد + نماذج شذوذ، وتشغيل لعب استجابة (${dh || "مصادر"}).`,
      en: `Illustrative example: centralize logs from critical sources, combine rule-based and anomaly detection, and run response playbooks (${dh || "sources"}).`,
    },
    production: {
      ar: `مثال توضيحي: اربط بيانات الإنتاج بالجودة، وضع عتبات للهدر، واقترح جداول صيانة استباقية (${gh || "الهدف"}).`,
      en: `Illustrative example: connect throughput with quality signals, set waste thresholds, and suggest preventive maintenance windows (${gh || "goal"}).`,
    },
    precisionAg: {
      ar: `مثال توضيحي: جدولة الري حسب الرطوبة والطقس، وتنبيهات للملوحة/النقص، مع تقارير موسمية (${dh || "الحقل"}).`,
      en: `Illustrative example: schedule irrigation from moisture + weather, alert on salinity gaps, and ship seasonal reports (${dh || "field context"}).`,
    },
    services: {
      ar: `مثال توضيحي: أتمتة تصنيف الطلبات، توقع أحجام الذروة، وتوزيع العمل على الفرق (${dh || "التدفقات"}).`,
      en: `Illustrative example: automate ticket triage, forecast peak load, and balance work across teams (${dh || "flows"}).`,
    },
  };

  return lines[scenario][locale];
}
