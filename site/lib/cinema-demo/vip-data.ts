export type VipMessage = {
  id: string;
  from: "concierge" | "guest";
  textAr: string;
  textEn: string;
  time: string;
  delayMs: number;
};

export type LoungeItem = {
  id: string;
  labelAr: string;
  labelEn: string;
  price: number;
  icon: "popcorn" | "drinks" | "choco" | "family" | "vip-pack";
};

export const VIP_MESSAGES: VipMessage[] = [
  {
    id: "m1",
    from: "concierge",
    textAr: "مساء الخير، أحمد",
    textEn: "Good evening, Ahmad",
    time: "9:45 م",
    delayMs: 800,
  },
  {
    id: "m2",
    from: "concierge",
    textAr: "رصيد نقاطك الحالي: 2,400 نقطة",
    textEn: "Your points balance: 2,400 points",
    time: "9:45 م",
    delayMs: 1600,
  },
  {
    id: "m3",
    from: "concierge",
    textAr: "ما فيلمك الليلة؟",
    textEn: "What's your film tonight?",
    time: "9:45 م",
    delayMs: 2400,
  },
  {
    id: "m4",
    from: "guest",
    textAr: "أريد أفضل مقعدين اليوم",
    textEn: "I want the best seats tonight",
    time: "9:46 م",
    delayMs: 3800,
  },
  {
    id: "m5",
    from: "concierge",
    textAr: "تم الحجز: A1, A2 — صف ملكي VIP",
    textEn: "Booked: A1, A2 — royal VIP row",
    time: "9:46 م",
    delayMs: 5200,
  },
  {
    id: "m6",
    from: "concierge",
    textAr: "وجبة VIP مضافة مجاناً — التذكرة في الواتساب",
    textEn: "Complimentary VIP meal — ticket sent via WhatsApp",
    time: "9:46 م",
    delayMs: 6600,
  },
];

export const LOUNGE_ITEMS: LoungeItem[] = [
  { id: "popcorn", labelAr: "بوشار بالكراميل", labelEn: "Caramel popcorn", price: 3500, icon: "popcorn" },
  { id: "drinks", labelAr: "مشروبات", labelEn: "Drinks", price: 2500, icon: "drinks" },
  { id: "choco", labelAr: "شوكولاتة", labelEn: "Chocolate", price: 1500, icon: "choco" },
  { id: "family", labelAr: "وجبة عائلية", labelEn: "Family combo", price: 12000, icon: "family" },
  { id: "vip-pack", labelAr: "باقة VIP", labelEn: "VIP bundle", price: 15000, icon: "vip-pack" },
];

export const UPSELL_BUNDLE = {
  id: "vip-meal",
  labelAr: "وجبة VIP",
  labelEn: "VIP meal",
  descAr: "بوشار كبير + مشروب + شوكولاتة",
  descEn: "Large popcorn + drink + chocolate",
  price: 3500,
  save: 1500,
};
