const MISSION_AR: Record<string, string> = {
  daily_close_one: "أغلق صفقة واحدة اليوم",
  daily_two_leads: "أضف عميلين محتملين اليوم",
  daily_referral: "إحالة جديدة سجّلت اليوم",
};

const MISSION_FR: Record<string, string> = {
  daily_close_one: "Conclure 1 affaire aujourd'hui",
  daily_two_leads: "Ajouter 2 leads aujourd'hui",
  daily_referral: "Parrainage inscrit aujourd'hui",
};

const MISSION_EN: Record<string, string> = {
  daily_close_one: "Close 1 deal today",
  daily_two_leads: "Add 2 leads today",
  daily_referral: "Referral signed up today",
};

export function resolveMissionTitle(key: string, locale: string, fallback: string): string {
  if (locale === "ar") return MISSION_AR[key] ?? fallback;
  if (locale === "fr") return MISSION_FR[key] ?? fallback;
  return MISSION_EN[key] ?? fallback;
}
