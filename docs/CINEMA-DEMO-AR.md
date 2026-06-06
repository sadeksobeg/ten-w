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

---

## 7. قاعة المقاعد 3D (`seats3d/`)

| ملف | دور |
|-----|-----|
| `seat-layout-3d.ts` | إحداثيات 3D، rake ~18°، ممرات، VIP/wheelchair |
| `camera-presets.ts` | overview · immersive · focus |
| `smart-pick.ts` | أفضل مقاعد متاحة (center-front) |
| `CinemaSeatHall3D.tsx` | Canvas R3F + dynamic import (`ssr: false`) |
| `InstancedSeats.tsx` | `InstancedMesh` — أداء 60fps |
| `CameraRig.tsx` | OrbitControls + lerp بين presets |
| `SeatHud.tsx` | كاميرا، smart pick، mini-map، toggle 3D/2D |
| `CinemaSeatExperience.tsx` | wrapper: WebGL أو `prefers-reduced-motion` → `CinemaSeatMap` 2D |

**Store:** `seatView`, `cameraPreset`, `focusedSeatId`, `smartPickSeats()`

**Fallback:** فشل WebGL أو reduced-motion → خريطة 2D تلقائياً + toggle يدوي.

---

## 8. لوحة المدير (`components/cinema-demo/manager/`)

- `ManagerTopBar` · `KpiCards` · `ScreensStatus` · `RevenueChart`
- `PeakHeatmap` · `BookingsFeed` (interval 4s) · `AlertsPanel` · `StaffOverview`

---

## 9. ROI

```typescript
extraRevenueMonthly = seats × 0.12 × avgTicket × 20 shows
timeSavedHours = 3 × 30
roiRatio = extraRevenueMonthly / 4_500_000 SYP
```

Slider 50–500 مقعد → CTA `/contact?intent=demo&topic=cinema`

---

## 10. بنية الملفات (v2 + 3D)

```
site/components/cinema-demo/
├── CinemaBrandLogo.tsx · CinemaCustomCursor.tsx · CinemaFilmGrain.tsx
├── CinemaSeatExperience.tsx · seats3d/ (Hall3D, InstancedSeats, CameraRig, SeatHud)
├── hooks/useAnimatedNumber.ts · useLiveSeatSimulation.ts
├── manager/ (8 modules)
└── phases/
    ├── CinemaModeSelectorPhase.tsx · CinemaManagerPhase.tsx · CinemaVipPhase.tsx
    ├── CinemaUpsellPhase.tsx · CinemaRoiPanel.tsx · CinemaClosingPhase.tsx
    └── … (customer flow phases)
```

---

## 11. i18n

Namespace **`CinemaDemo`** — مفاتيح: `modes`, `manager`, `vip`, `roi`, `closing`, `upsell`, `seats.view3d/view2d`, `cameraOverview/Immersive`, `smartPick`, `webglFallback`

---

## 12. قيود

- صفر packages جديدة
- Canvas + AudioContext + CSS فقط
- `prefers-reduced-motion`: grain/countdown audio off
- لا Growth / invite / PartnerProfile

---

## 13. النشر

```bash
cd site && npx tsc --noEmit && npm run build
bash scripts/server-update.sh
```

---

## 14. تقرير شامل — ما تم تنفيذه

### 14.1 الدفعة الأولى — Cinema OS v2 (`146ab5b`)

| المكوّن | التفاصيل |
|---------|----------|
| **ثلاثة أوضاع** | عميل · مدير · VIP مع `demoMode` في Zustand |
| **مسار العميل** | أفلام → مواعيد → مقاعد → checkout → upsell → تذكرة → ROI → closing |
| **لوحة المدير** | KPIs، إيرادات أسبوعية، heatmap، feed حي، تنبيهات، طاقم |
| **VIP** | دخول VIP، chat كونسierge، صالة lounge |
| **ROI** | حاسبة مقاعد 50–500 مع CTA تواصل |
| **صوت** | AudioContext — نقر مقعد، projector، chime |
| **i18n** | ar / en / fr — namespace `CinemaDemo` |

### 14.2 الدفعة الثانية — Polish احترافي (`acf693b`)

- **`CinemaBrandLogo`**: wordmark SVG/CSS بدل PNG على الـ header
- **`CinemaIcon`**: أيقونات SVG موحّدة (بدون emoji)
- **Immersive mode**: إخفاء chrome الموقع داخل الديمو
- **Cursor مخصص** ذهبي حسب الوضع
- **Film grain** + ambient particles

### 14.3 الدفعة الثالثة — قاعة 3D + Full Pass (`8f1e57c`)

#### أ) هندسة 3D

| ملف | الوظيفة |
|-----|---------|
| `seat-layout-3d.ts` | تحويل `buildSeatMap()` → `{ x, y, z, tier, rowIndex }` مع rake ~18° وممرات |
| `camera-presets.ts` | overview · immersive · focus |
| `smart-pick.ts` | خوارزمية center-front لأفضل مقاعد متاحة |
| `useWebGLSupport.ts` | كشف WebGL + `prefers-reduced-motion` |

#### ب) مكوّنات R3F (`seats3d/`)

- **`CinemaSeatHall3D`**: Canvas + dynamic import (`ssr: false`)
- **`InstancedSeats`**: `InstancedMesh` واحد — أداء 60fps، ألوان live sim
- **`CameraRig`**: OrbitControls من `three/examples` + lerp بين presets
- **`SeatHud`**: toggle 3D/2D، أزرار كاميرا، smart pick، mini-map
- **`CinemaSeatExperience`**: wrapper يختار 3D أو fallback 2D

#### ج) Store — حقول جديدة

```typescript
seatView: '3d' | '2d'
cameraPreset: 'overview' | 'immersive' | 'focus'
focusedSeatId: string | null
hudHoverSeatId: string | null
smartPickSeats(count?: number)
```

#### د) Polish لكل الأوضاع

| المنطقة | التحسين |
|---------|---------|
| **Movies** | framer-motion stagger، rating badges، poster shine |
| **Showtime** | occupancy ring «Almost full» |
| **Checkout** | reveal animation للصفوف |
| **Upsell** | compare card (مع/بدون bundle) |
| **Ticket** | ceremony dolly-in على مراحل |
| **Manager** | RevenueChart crosshair + tooltip، BookingsFeed pulse، PeakHeatmap popover |
| **VIP** | typewriter chat، lounge fly-to-cart |
| **Closing** | بطاقات 3D tilt على hover |

#### هـ) CSS + i18n

- Block `.cinema-hall-3d` · `.cinema-seat-hud` · `.cinema-minimap`
- مفاتيح: `seats.view3d`, `view2d`, `cameraOverview`, `cameraImmersive`, `smartPick`, `webglFallback`, `dragHint`
- RTL: HUD + minimap mirrored

### 14.4 الدفعة الرابعة — Premium Visual Pass (هذه الجلسة)

**المشكلة:** المقاعد 3D مظلمة جداً، splash أصفر كامل، الواجهات تحتاج رفع بصري.

**الحل:**

| التغيير | التفاصيل |
|---------|----------|
| **إضاءة القاعة** | `hemisphereLight` + directional warm/cool + `AuditoriumAmbience` (جدران + fill lights) |
| **ألوان المقاعد** | velvet burgundy `#9a4d6a` · VIP gold `#c9922a` · emissive lift على المادة |
| **الشاشة** | ramp-up تدريجي (0→100% خلال ~2.8s) — **لا flash أصفر** عند البداية |
| **pointLight الشاشة** | خفّض من 2.0 → 0.08–0.5 مع decay |
| **Tone mapping** | ACESFilmic + exposure 1.15 |
| **Splash** | خلفية سينمائية داكنة (بنفسجي/أسود) بدل `#f5c518` |
| **UI premium** | glass tokens، gradient titles، gradient buttons، elevated cards |
| **HUD 3D** | overlay زجاجي فوق القاعة، أزرار `cinema-hud-btn` |

### 14.5 Fallback و a11y

1. فشل WebGL → `CinemaSeatMap` 2D تلقائياً
2. `prefers-reduced-motion` → 2D + إيقاف animations صوت/grain
3. Toggle يدوي 3D / List في HUD
4. Keyboard a11y على خريطة 2D (Tab/Arrow/Enter)

### 14.6 الأداء

- `InstancedMesh` — draw call واحد للمقاعد
- `dpr={[1, 1.5]}` على mobile
- Lazy load 3D chunk عبر `next/dynamic`
- Pause sim عند مغادرة phase seats (via hook)

### 14.7 Commits على `ten-w/main`

| Hash | الوصف |
|------|--------|
| `146ab5b` | Cinema OS v2 — 3 modes |
| `acf693b` | Wordmark SVG + icons + immersive polish |
| `8f1e57c` | 3D hall + camera + full pass |
| *(pending)* | Premium visual pass — إضاءة + splash + UI |

### 14.8 QA checklist

- [ ] Splash داكن — لا خلفية صفراء
- [ ] مقاعد 3D مرئية وواضحة (burgundy/gold)
- [ ] الشاشة تضيء تدريجياً بدون wash أصفر
- [ ] orbit · pinch · select · smart pick · max 6 seats
- [ ] fallback 2D عند reduced-motion
- [ ] Manager/VIP/Closing animations
- [ ] RTL ar — HUD mirrored

---

*T.E.N.E.G.T.A — Cinema OS Demo v2 + 3D Hall · Salamiya Cinema*
