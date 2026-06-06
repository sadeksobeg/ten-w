# تقرير — منظومة تشغيل سينما سلمية (Cinema OS Demo v2)

**التاريخ:** مايو 2026  
**المشروع:** TENEGTA Website — `ten-w` / `tenegta.com`  
**المسار:** `/ar/demo/cinema` · `/en/demo/cinema` · `/fr/demo/cinema`

---

## 1. ملخص تنفيذي

ديمو **full-screen** يحاكي **منظومة تشغيل سينما كاملة** لـ **سينما سلمية** — ثلاثة أوضاع (عميل / مدير / VIP)، حجز حي، upsell، لوحة مدير، حاسبة ROI، وclosing pitch — **بدون npm packages جديدة** و**بدون قاعدة بيانات**.

---

## 2. مسار التجربة

```
Splash (8s) → Mode Selector
  ├─ customer: movies → showtime → seats → checkout → upsell → ticket ceremony → ROI → closing
  ├─ manager: dashboard → ROI → closing
  └─ vip: entry → concierge chat → lounge → ROI → closing
```

---

## 3. الأوضاع الثلاثة

| الوضع | `demoMode` | نقطة البيع |
|-------|------------|------------|
| عميل | `customer` | حجز، مقاعد حية، upsell، تذكرة ceremony |
| مدير | `manager` | KPIs، charts، heatmap، حجوزات حية، تنبيهات |
| VIP | `vip` | كونسierge، صالة، نقاط ولاء |

---

## 4. Phase 0 — إصلاحات UX

| المشكلة | الحل |
|---------|------|
| الماوس مخفي | إزالة `cursor: none` — **`CinemaCustomCursor`** ذهبي حسب الوضع |
| لوغو أصفر على header | **`CinemaBrandLogo`**: splash=PNG، header=CSS wordmark |

---

## 5. Store (Zustand)

```typescript
type DemoMode = 'customer' | 'manager' | 'vip'
type CinemaDemoPhase =
  | 'splash' | 'modeSelect'
  | 'movies' | 'showtime' | 'seats' | 'checkout' | 'upsell' | 'ticket'
  | 'manager' | 'vip' | 'roi' | 'closing'
```

حقول: `upsellAdded`, `upsellItems[]`, `roiSeats`, `soundEnabled`, `liveBrowsers`, `transitionClass`

---

## 6. بيانات ومساعدات (`site/lib/cinema-demo/`)

| ملف | محتوى |
|-----|--------|
| `manager-data.ts` | KPIs، قاعات، heatmap 7×6، feed، alerts، staff |
| `vip-data.ts` | رسائل concierge، lounge، upsell bundle |
| `roi.ts` | `calcRoi(seats)` — إيراد إضافي، ساعات موفّرة، نسبة 1:8.3 |
| `sounds.ts` | AudioContext — seat click، projector tick، chime |
| `charts.ts` | sparklines + line chart على canvas |

---

## 7. لوحة المدير (`components/cinema-demo/manager/`)

- `ManagerTopBar` · `KpiCards` · `ScreensStatus` · `RevenueChart`
- `PeakHeatmap` · `BookingsFeed` (interval 4s) · `AlertsPanel` · `StaffOverview`

---

## 8. ROI

```typescript
extraRevenueMonthly = seats × 0.12 × avgTicket × 20 shows
timeSavedHours = 3 × 30
roiRatio = extraRevenueMonthly / 4_500_000 SYP
```

Slider 50–500 مقعد → CTA `/contact?intent=demo&topic=cinema`

---

## 9. بنية الملفات (v2)

```
site/components/cinema-demo/
├── CinemaBrandLogo.tsx · CinemaCustomCursor.tsx · CinemaFilmGrain.tsx
├── CinemaProgressBar.tsx · CinemaSoundToggle.tsx · CinemaTicketCeremony.tsx
├── hooks/useAnimatedNumber.ts · useLiveSeatSimulation.ts
├── manager/ (8 modules)
└── phases/
    ├── CinemaModeSelectorPhase.tsx · CinemaManagerPhase.tsx · CinemaVipPhase.tsx
    ├── CinemaUpsellPhase.tsx · CinemaRoiPanel.tsx · CinemaClosingPhase.tsx
    └── … (customer flow phases)
```

---

## 10. i18n

Namespace **`CinemaDemo`** — مفاتيح جديدة: `modes`, `manager`, `vip`, `roi`, `closing`, `upsell`, `soundOn/Off`

---

## 11. قيود

- صفر packages جديدة
- Canvas + AudioContext + CSS فقط
- `prefers-reduced-motion`: grain/countdown audio off
- لا Growth / invite / PartnerProfile

---

## 12. النشر

```bash
cd site && npx tsc --noEmit && npm run build
bash scripts/server-update.sh
```

---

*T.E.N.E.G.T.A — Cinema OS Demo v2 · Salamiya Cinema*
