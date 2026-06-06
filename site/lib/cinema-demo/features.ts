export type CinemaFeature = {
  id: number;
  titleAr: string;
  titleEn: string;
  badge?: string;
};

export const CINEMA_FEATURES: CinemaFeature[] = [
  { id: 1, titleAr: "نظام التنبؤ الذكي", titleEn: "AI demand prediction", badge: "AI" },
  { id: 2, titleAr: "محرك التسعير الديناميكي", titleEn: "Dynamic pricing engine" },
  { id: 3, titleAr: "تذكرة واتساب فورية", titleEn: "Instant WhatsApp ticket" },
  { id: 4, titleAr: "تسجيل دخول بالوجه", titleEn: "Facial recognition check-in" },
  { id: 5, titleAr: "لوحة الإيرادات الحية", titleEn: "Real-time revenue dashboard" },
  { id: 6, titleAr: "إدارة الفروع", titleEn: "Multi-branch management" },
  { id: 7, titleAr: "نقاط الولاء", titleEn: "Loyalty points system" },
  { id: 8, titleAr: "جدولة الطاقم", titleEn: "Staff scheduling" },
  { id: 9, titleAr: "تنبيهات الصيانة", titleEn: "Maintenance alerts" },
  { id: 10, titleAr: "تكامل المأكولات", titleEn: "Food & beverage integration" },
  { id: 11, titleAr: "أتمتة التسويق", titleEn: "Marketing automation" },
  { id: 12, titleAr: "تحليلات العملاء", titleEn: "Customer analytics" },
  { id: 13, titleAr: "تحليل السوق", titleEn: "Competitor intelligence" },
  { id: 14, titleAr: "إدارة الامتلاء", titleEn: "Capacity overflow management" },
  { id: 15, titleAr: "بوابات الدفع المتعددة", titleEn: "Payment gateway diversity" },
  { id: 16, titleAr: "التحكم بالإسقاط", titleEn: "Real-time projector control" },
  { id: 17, titleAr: "بلاغات الحوادث", titleEn: "Incident reporting" },
  { id: 18, titleAr: "التقارير المالية", titleEn: "Financial reports" },
  { id: 19, titleAr: "التكاملات النشطة", titleEn: "API integrations" },
  { id: 20, titleAr: "محرك الهوية المخصصة", titleEn: "Custom branding engine" },
];

export function getFeature(id: number): CinemaFeature | undefined {
  return CINEMA_FEATURES.find((f) => f.id === id);
}
