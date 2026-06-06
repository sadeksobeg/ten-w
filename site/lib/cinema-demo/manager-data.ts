export type ManagerKpi = {
  id: string;
  labelAr: string;
  labelEn: string;
  value: number;
  suffixAr: string;
  suffixEn: string;
  trend: number;
  trendLabelAr: string;
  trendLabelEn: string;
  sparkline: number[];
};

export type ScreenStatus = {
  id: number;
  nameAr: string;
  nameEn: string;
  status: "active" | "upcoming" | "issue";
  movieAr: string;
  movieEn: string;
  timeRange: string;
  occupancy: number;
  capacity: number;
  revenue: number;
  startsInMin?: number;
};

export type BookingFeedItem = {
  id: string;
  name: string;
  tickets: number;
  movieAr: string;
  movieEn: string;
  hallAr: string;
  hallEn: string;
  time: string;
  amount: number;
};

export type ManagerAlert = {
  id: string;
  type: "warning" | "success" | "insight";
  textAr: string;
  textEn: string;
  actionAr: string;
  actionEn: string;
};

export const MANAGER_KPIS: ManagerKpi[] = [
  {
    id: "revenue",
    labelAr: "إيرادات اليوم",
    labelEn: "Today's revenue",
    value: 2847500,
    suffixAr: "ل.س",
    suffixEn: "SYP",
    trend: 12,
    trendLabelAr: "↑ 12%",
    trendLabelEn: "↑ 12%",
    sparkline: [1.8, 2.1, 2.4, 2.2, 2.6, 2.8, 2.85],
  },
  {
    id: "tickets",
    labelAr: "التذاكر المباعة",
    labelEn: "Tickets sold",
    value: 189,
    suffixAr: "تذكرة",
    suffixEn: "tickets",
    trend: 8,
    trendLabelAr: "↑ 8 أمس",
    trendLabelEn: "↑ 8 vs yesterday",
    sparkline: [120, 145, 160, 155, 170, 180, 189],
  },
  {
    id: "occupancy",
    labelAr: "نسبة الامتلاء",
    labelEn: "Occupancy",
    value: 73,
    suffixAr: "%",
    suffixEn: "%",
    trend: 5,
    trendLabelAr: "↑ 5% أمس",
    trendLabelEn: "↑ 5% vs yesterday",
    sparkline: [58, 62, 65, 68, 70, 72, 73],
  },
  {
    id: "avg",
    labelAr: "متوسط قيمة التذكرة",
    labelEn: "Avg ticket value",
    value: 15065,
    suffixAr: "ل.س",
    suffixEn: "SYP",
    trend: 0,
    trendLabelAr: "ثابت",
    trendLabelEn: "Stable",
    sparkline: [14.8, 15.0, 15.1, 15.0, 15.2, 15.0, 15.065],
  },
];

export const SCREEN_STATUSES: ScreenStatus[] = [
  {
    id: 1,
    nameAr: "القاعة 1 — IMAX",
    nameEn: "Hall 1 — IMAX",
    status: "active",
    movieAr: "كثيب — الجزء الثالث",
    movieEn: "Dune: Part Three",
    timeRange: "19:30 — 21:45",
    occupancy: 78,
    capacity: 120,
    revenue: 1410000,
  },
  {
    id: 2,
    nameAr: "القاعة 2 — VIP",
    nameEn: "Hall 2 — VIP",
    status: "active",
    movieAr: "ليلة كوميديا",
    movieEn: "Comedy Night Live",
    timeRange: "20:00 — 21:50",
    occupancy: 60,
    capacity: 60,
    revenue: 540000,
  },
  {
    id: 3,
    nameAr: "القاعة 3",
    nameEn: "Hall 3",
    status: "upcoming",
    movieAr: "أرض الأحلام",
    movieEn: "Land of Dreams",
    timeRange: "22:15",
    occupancy: 84,
    capacity: 80,
    revenue: 955000,
    startsInMin: 47,
  },
];

export const WEEKLY_REVENUE_THIS = [1.2, 0.8, 1.5, 2.1, 2.8, 3.2, 2.1];
export const WEEKLY_REVENUE_LAST = [0.9, 1.1, 1.3, 1.8, 2.2, 2.9, 1.8];
export const WEEK_DAYS_AR = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
export const WEEK_DAYS_EN = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

/** 7 days × 6 slots — occupancy 0–100 */
export const PEAK_HEATMAP: number[][] = [
  [20, 35, 45, 55, 70, 85],
  [25, 40, 50, 60, 75, 80],
  [30, 45, 55, 65, 72, 78],
  [35, 50, 60, 75, 88, 92],
  [40, 55, 65, 80, 95, 98],
  [45, 60, 70, 85, 90, 88],
  [50, 65, 75, 82, 88, 85],
];

export const PEAK_SLOTS_AR = ["14:00", "16:00", "18:00", "20:00", "22:00", "24:00"];
export const PEAK_SLOTS_EN = ["14:00", "16:00", "18:00", "20:00", "22:00", "24:00"];

export const INITIAL_BOOKINGS: BookingFeedItem[] = [
  { id: "b1", name: "أحمد", tickets: 2, movieAr: "كثيب", movieEn: "Dune", hallAr: "قاعة 1", hallEn: "Hall 1", time: "19:30", amount: 30000 },
  { id: "b2", name: "سارة", tickets: 4, movieAr: "ليلة كوميديا", movieEn: "Comedy", hallAr: "قاعة 2", hallEn: "Hall 2", time: "20:00", amount: 80000 },
  { id: "b3", name: "محمد", tickets: 1, movieAr: "أرض الأحلام", movieEn: "Dreams", hallAr: "قاعة 3", hallEn: "Hall 3", time: "22:15", amount: 15000 },
];

export const BOOKING_NAMES = ["ليلى", "كريم", "نور", "ياسر", "مريم", "فادي", "رامي", "هبة"];
export const BOOKING_MOVIES = [
  { ar: "كثيب", en: "Dune", hallAr: "قاعة 1", hallEn: "Hall 1" },
  { ar: "ليلة كوميديا", en: "Comedy", hallAr: "قاعة 2", hallEn: "Hall 2" },
  { ar: "أرض الأحلام", en: "Dreams", hallAr: "قاعة 3", hallEn: "Hall 3" },
];

export const MANAGER_ALERTS: ManagerAlert[] = [
  {
    id: "a1",
    type: "warning",
    textAr: "القاعة 2 — مشكلة في مكيف الصف الأمامي",
    textEn: "Hall 2 — AC issue in front row",
    actionAr: "تم إبلاغ الصيانة",
    actionEn: "Maintenance notified",
  },
  {
    id: "a2",
    type: "success",
    textAr: "تم بيع 100% من تذاكر عرض 21:30 في القاعة 1",
    textEn: "100% sold out for 21:30 show in Hall 1",
    actionAr: "مبروك",
    actionEn: "Congrats",
  },
  {
    id: "a3",
    type: "insight",
    textAr: "شعبية فيلم كثيب أعلى من المتوقع بـ 34% — ننصح بعرض إضافي",
    textEn: "Dune 34% above forecast — add extra showtime",
    actionAr: "عرض التفاصيل",
    actionEn: "View details",
  },
];

export const STAFF_SECTIONS = [
  { id: "box", labelAr: "موظفو الشباك", labelEn: "Box office", count: 4, active: 4 },
  { id: "security", labelAr: "أمن ومداخل", labelEn: "Security", count: 2, active: 2 },
  { id: "concessions", labelAr: "المطبخ والمشروبات", labelEn: "Concessions", count: 3, active: 3 },
];
