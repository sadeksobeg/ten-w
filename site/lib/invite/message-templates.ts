import type { InviteTier } from "@/lib/invite/generate";

export type InviteBenefit = {
  label: string;
  icon: "network" | "team" | "star" | "partnership" | "projects" | "priority";
};

export const INVITE_TIER_LABELS: Record<InviteTier, string> = {
  "CONTENT CREATOR": "صانع محتوى",
  "SERVICE PARTNER": "شريك خدمات / تعاون",
  "CREATIVE PARTNER": "شريك إبداعي",
  "BRAND AMBASSADOR": "سفير العلامة",
};

export const TENEGTA_LINKS = {
  website: "https://tenegta.com",
  facebook: "https://www.facebook.com/tenegta",
  instagram: "https://www.instagram.com/tenegta0",
} as const;

/** Ready-to-send WhatsApp / platform message — replace name and paste invite URL. */
export function buildInviteOutreachMessage(name: string, inviteUrl: string): string {
  return `${name}،

يسعدنا إرسال بطاقة دعوتك الرقمية إلى TENEGTA.
افتح الرابط، اقبل الدعوة، واحفظ بطاقتك الرسمية:
${inviteUrl}

إذا رغبت في التعرّف أكثر قبل القبول — أو لعمل ريفيو عن التجربة — يمكنك استكشاف صفحاتنا:
🌐 ${TENEGTA_LINKS.website}
📘 ${TENEGTA_LINKS.facebook}
📸 ${TENEGTA_LINKS.instagram}

نتطلع إلى انطلاقتنا معاً.`;
}

/** Default message shown in admin when creating a new invite (editable before send). */
export const INVITE_MESSAGE_TEMPLATES: Record<InviteTier, string> = {
  "CONTENT CREATOR":
    "يسعدنا دعوتك للانضمام إلى TENEGTA ASCEND — برنامجنا الحصري لصنّاع المحتوى. نتطلع إلى استكشاف إمكانيات التعاون معك، ومناقشة الرؤى المشتركة، وبناء شراكة إبداعية مستدامة. يمكنك التعرّف على عالمنا عبر tenegta.com وصفحاتنا قبل قبول الدعوة إذا رغبت. تفضل بقبول دعوتك الرقمية لتفعيل بطاقتك والانضمام رسمياً.",
  "SERVICE PARTNER":
    "يسعدنا دعوتك للتعاون مع TENEGTA في تقديم خدماتكم المتخصصة ضمن منظومتنا التقنية. نرحّب باستكشاف فرص الشراكة التشغيلية، وتوضيح نطاق التعاون، وبناء علاقة مهنية طويلة الأمد. تفضل بقبول دعوتك الرقمية لبدء المرحلة التالية.",
  "CREATIVE PARTNER":
    "يسعدنا دعوتك للانضمام إلى TENEGTA كشريك إبداعي. نتطلع إلى دمج رؤيتك مع منظومتنا، واستكشاف مشاريع مشتركة، وبناء شراكة نوعية في المرحلة القادمة. تفضل بقبول دعوتك الرقمية لتفعيل حضورك.",
  "BRAND AMBASSADOR":
    "يسعدنا دعوتك لتمثيل TENEGTA كسفير للعلامة. نؤمن بأن حضورك يعكس قيمنا، ونتطلع إلى بناء شراكة طويلة الأمد تجمع الرؤية والتأثير. تفضل بقبول دعوتك الرقمية لتفعيل بطاقتك.",
};

/** Use when you already met and agreed — paste into the message field. */
export const INVITE_MESSAGE_AFTER_MEETING =
  "بعد لقائنا المُثمر واتفاقنا على التعاون، يسعدنا أن نقدّم لك بطاقة دخولك الرسمية إلى TENEGTA ASCEND. هذه خطوتك التالية لتفعيل حضورك رسمياً، واستكشاف ما ينتظرك من مشاريع وشراكات نوعية في المرحلة القادمة. للتعرّف أكثر: tenegta.com · facebook.com/tenegta · instagram.com/tenegta0. نحن متحمّسون للانطلاق معك. مع خالص التقدير";

export const INVITE_BENEFITS_BY_TIER: Record<InviteTier, InviteBenefit[]> = {
  "CONTENT CREATOR": [
    { label: "وصول حصري للشبكة", icon: "network" },
    { label: "تعاون مع الفريق", icon: "team" },
    { label: "محتوى مميز ومدفوع", icon: "star" },
    { label: "شراكة طويلة المدى", icon: "partnership" },
  ],
  "SERVICE PARTNER": [
    { label: "مشاريع وتكليفات واضحة", icon: "projects" },
    { label: "تعاون تشغيلي مع الفريق", icon: "team" },
    { label: "أولوية في فرص التعاون", icon: "priority" },
    { label: "شراكة طويلة الأمد", icon: "partnership" },
  ],
  "CREATIVE PARTNER": [
    { label: "مشاريع إبداعية مشتركة", icon: "projects" },
    { label: "تعاون مع الفريق", icon: "team" },
    { label: "وصول حصري للشبكة", icon: "network" },
    { label: "شراكة طويلة المدى", icon: "partnership" },
  ],
  "BRAND AMBASSADOR": [
    { label: "تمثيل العلامة رسمياً", icon: "star" },
    { label: "وصول حصري للشبكة", icon: "network" },
    { label: "تعاون مع الفريق", icon: "team" },
    { label: "شراكة طويلة المدى", icon: "partnership" },
  ],
};

export function normalizeInviteTier(tier: string): InviteTier {
  const upper = tier.toUpperCase();
  if (upper in INVITE_MESSAGE_TEMPLATES) {
    return upper as InviteTier;
  }
  return "CONTENT CREATOR";
}

export function benefitsForTier(tier: string): InviteBenefit[] {
  return INVITE_BENEFITS_BY_TIER[normalizeInviteTier(tier)];
}
