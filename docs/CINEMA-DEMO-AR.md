# تقرير — منظومة تشغيل سينما سلمية (Cinema OS Unified Experience)

**التاريخ:** يونيو 2026  
**المشروع:** TENEGTA Website — `ten-w` / `tenegta.com`  
**المسار:** `/ar/demo/cinema` · `/en/demo/cinema` · `/fr/demo/cinema`

---

## 1. ملخص تنفيذي

ديمو **full-screen** يحاكي **منظومة تشغيل سينما كاملة** لـ **سينما سلمية** — سردية موحّدة من منظور **مدير العمليات**: إقلاع OS → سطح مكتب حي → حجز تجريبي → كشف الجلسة → ROI → closing pitch.

**بدون npm packages جديدة** · **بدون قاعدة بيانات** · **ar / en / fr** · **RTL كامل**

> **تحديث يونيو 2026:** استُبدلت تجربة «ثلاثة أوضاع» (عميل / مدير / VIP) بتجربة **Cinema OS Unified** — ثم أُجريت **جولة تلميع UI شاملة** (طبقات، hydration، RTL، a11y، فحص كل مرحلة في المتصفح).

---

## 2. مسار التجربة (الحالي)

```
boot (25s POST → bars → auth → briefing)
  → movies → showtime → seats (3D/2D) → checkout → upsell
  → ticket ceremony → sessionReveal → roi → closing
```

| المرحلة | الغرض |
|---------|--------|
| **boot** | POST BIOS، شريط تحميل، بصمة، معاينة سطح المكتب، CTA «ابدأ جلستك» + تخطي |
| **movies … ticket** | حجز تجريبي كامل مع Feature Moments (20 ميزة) |
| **sessionReveal** | إحصائيات الجلسة + شبكة 20 ميزة مُضاءة |
| **roi** | حاسبة عائد + timeline تسليم |
| **closing** | pitch TENEGTA + CTA تواصل + إعادة التجربة |

---

## 3. سطح مكتب Cinema OS (`CinemaOSDesktop`)

| المنطقة | المكوّنات |
|---------|-----------|
| **Chrome ثابت** | شريط تقدّم · LiveTicker · OsTopBar (فرع + تاريخ/ساعة) · زر صوت |
| **يسار** | ScreenMonitors — حالة القاعات الثلاث |
| **وسط** | مرحلة الحجز / الكشف / ROI / Closing |
| **يمين** | BookingFeedLive · RevenueGauge · WeatherIntel · Staff · Analytics · Competitor · Incident · Reports · ApiIntegrations (+ ProjectorControl في seats) |
| **عائم** | FloatingWidgets (حالة النظام) · NotificationSystem |

**إخفاء الألواح الجانبية** في `sessionReveal` و `closing` — المحتوى بعرض كامل.

---

## 4. Store (Zustand)

```typescript
type CinemaDemoPhase =
  | 'boot' | 'movies' | 'showtime' | 'seats' | 'checkout' | 'upsell'
  | 'ticket' | 'sessionReveal' | 'roi' | 'closing'

// حقول رئيسية
bootStage · osReady · sessionStartedAt
liveRevenue · revenueTarget · featuresSeen[] · bookingFeed[]
activeBranch · grainIntensity · screenMode
seatView · cameraPreset · focusedSeatId · smartPickAnimating
```

**إزالة:** `demoMode` · phases `splash` · `modeSelect` · `manager` · `vip`

---

## 5. Feature Moments (20 ميزة)

- **`lib/cinema-demo/features.ts`** — تعريف 20 ميزة (تنبؤ، تسعير ديناميكي، واتساب، وجه، …)
- **`FeatureMoment.tsx`** — overlay ثابت أو inline حسب المرحلة؛ يُسجّل `featuresSeen`
- تظهر في: showtime · checkout · upsell · ticket ceremony · وغيرها

---

## 6. بيانات ومساعدات (`site/lib/cinema-demo/`)

| ملف | محتوى |
|-----|--------|
| `data.ts` | أفلام · مواعيد · مقاعد |
| `manager-data.ts` | KPIs، قاعات، feed، alerts |
| `vip-data.ts` | upsell bundle |
| `roi.ts` | `calcRoi(seats)` |
| `sounds.ts` | AudioContext — boot · auth · chime |
| `features.ts` | 20 ميزة Cinema OS |
| `seat-layout-3d.ts` | إحداثيات 3D + rake |
| `camera-presets.ts` | overview · immersive · focus · vip · birdsEye |

---

## 7. قاعة المقاعد 3D (`seats3d/`)

| ملف | دور |
|-----|-----|
| `HallGeometry.tsx` · `HallLighting.tsx` | جدران · إضاءة · tone mapping |
| `CinemaScreenMesh.tsx` · `ProjectorBeam.tsx` | شاشة + beam |
| `DustParticles.tsx` · `HallEvents.tsx` | جزicles · أحداث حية |
| `InstancedSeats.tsx` | `InstancedMesh` 60fps |
| `CameraRig.tsx` | OrbitControls + lerp |
| `SeatHud.tsx` | 3D/2D · كاميرا · smart pick · minimap صفوف |
| `CinemaSeatExperience.tsx` | WebGL أو fallback 2D |

**Fallback:** `prefers-reduced-motion` أو فشل WebGL → `CinemaSeatMap` 2D.

---

## 8. مراحل جديدة (Unified)

| ملف | دور |
|-----|-----|
| `CinemaBootOS.tsx` | إقلاع 25s — POST · bars · auth · briefing |
| `CinemaSessionRevealPhase.tsx` | إحصائيات + شبكة 20 ميزة + CTA ROI |
| `CinemaOSDesktop.tsx` | shell موحّد لكل المراحل بعد boot |
| `os/*` | LiveTicker · ScreenMonitors · BookingFeedLive · … |

**محذوف:** `CinemaModeSelectorPhase` · `CinemaSplashPhase` · `CinemaManagerPhase` · `CinemaVipPhase`

---

## 9. ROI

```typescript
extraRevenueMonthly = seats × 0.12 × avgTicket × 20 shows
timeSavedHours = 3 × 30
roiRatio = extraRevenueMonthly / 4_500_000 SYP
```

Slider 50–500 مقعد · timeline 4 أسابيع · CTA `/contact?intent=demo&topic=cinema`

---

## 10. بنية الملفات (Unified)

```
site/components/cinema-demo/
├── CinemaOSDesktop.tsx · CinemaDemoExperience.tsx · CinemaDemoChrome.tsx
├── CinemaProgressBar.tsx · CinemaTicketCeremony.tsx · CinemaFilmGrain.tsx
├── features/FeatureMoment.tsx
├── os/ (LiveTicker, OsTopBar, ScreenMonitors, BookingFeedLive, …)
├── seats3d/ (Hall*, InstancedSeats, SeatHud, …)
├── hooks/ (useTypewriter, useAnimatedNumber, …)
└── phases/
    ├── CinemaBootOS.tsx
    ├── CinemaMoviesPhase · CinemaShowtimePhase · CinemaSeatsPhase
    ├── CinemaCheckoutPhase · CinemaUpsellPhase · CinemaTicketPhase
    ├── CinemaSessionRevealPhase · CinemaRoiPanel · CinemaClosingPhase

site/app/[locale]/demo/cinema/
├── cinema-demo.css · cinema-os.css · layout.tsx · page.tsx

site/stores/cinema-demo-store.ts
site/messages/{ar,en,fr}.json → CinemaDemo.*
```

---

## 11. i18n

Namespace **`CinemaDemo`** — مفاتيح جديدة:

- `boot.*` · `os.*` (greeting, topbar, panels, **`progressLabel`**, **`systemStatus`**)
- `features.*` · `sessionReveal.*`
- `closing.v2*` · `seats.*` · `ticket.*` · `roi.*`

---

## 12. قيود

- صفر packages جديدة
- TypeScript strict · RTL عربي
- `prefers-reduced-motion`: grain off · 3D→2D · ticket ceremony مختصر
- لا Growth / invite / PartnerProfile
- لا تعديل ملف الخطة الأصلي

---

## 13. النشر

```bash
cd site && npx tsc --noEmit && npm run build
bash scripts/server-update.sh
```

**ملاحظة dev:** إذا كان المنفذ 3000 يعرض bundle قديم، أعد تشغيل `npm run dev` أو استخدم المنفذ الجديد (مثلاً 3001).

---

## 14. سجل التنفيذ الكامل

### 14.1 الدفعة الأولى — Cinema OS v2 (`146ab5b`)

ثلاثة أوضاع (عميل / مدير / VIP) · لوحة مدير · VIP · ROI · صوت · i18n.

### 14.2 الدفعة الثانية — Polish (`acf693b`)

Wordmark SVG · أيقونات · cursor · grain · immersive chrome.

### 14.3 الدفعة الثالثة — 3D Hall (`8f1e57c`)

seat-layout-3d · InstancedSeats · CameraRig · SeatHud · smart pick · polish لكل الأوضاع.

### 14.4 الدفعة الرابعة — Premium Visual (`afbc387`)

إضاءة قاعة · splash داكن · UI glass · HUD زجاجي · tone mapping.

### 14.5 الدفعة الخامسة — Unified Cinema OS (`97a3e9e`)

| التغيير | التفاصيل |
|---------|----------|
| **سردية موحّدة** | boot → OS desktop → booking → sessionReveal → roi → closing |
| **إزالة 3 modes** | حذف selector · manager phase · vip phase |
| **CinemaBootOS** | POST 25s · bars · auth · briefing · flash |
| **CinemaOSDesktop** | ticker · side panels · notifications · revenue live |
| **Session Reveal** | 20 feature cards · إحصائيات الجلسة |
| **3D محسّن** | HallGeometry · Lighting · Screen · Projector · Dust · Events |
| **Store** | `bootStage` · `liveRevenue` · `featuresSeen` · `bookingFeed` · … |
| **CSS** | `cinema-os.css` جديد |
| **i18n** | `boot.*` · `os.*` · `features.*` · `sessionReveal.*` · closing v2 |

### 14.6 الدفعة السادسة — UI Polish & QA (يونيو 2026)

**الهدف:** فحص كل واجهة وفق أعلى معيار — إصلاح التراكبات · hydration · RTL · responsive.

#### أ) طبقات وتخطيط

| المشكلة | الحل |
|---------|------|
| شريط تقدّم مكرّر/ثابت يغطي ticker | **`CinemaProgressBar`** فقط داخل `cinema-os-chrome` — أُزيل من كل phases |
| grain z-index 999 | grain `fixed` z-index 2 · إزالة duplicate من `cinema-os.css` |
| ambient مكرّر | grain/ambient في `CinemaDemoChrome` فقط |
| sticky bar + status + sound تتداخل | `cinema-os--action-bar` · padding-bottom · status يُرفع في مراحل غير action-bar |
| chrome header | `cinema-os-chrome` sticky: progress + ticker + topbar row + sound inline |

#### ب) مكوّنات

| المكوّن | الإصلاح |
|---------|---------|
| **CinemaFilmGrain** | render بعد `mounted` — إصلاح hydration |
| **CinemaBootOS** | `reduced` عبر useEffect · تخطي دائماً · briefing scroll · scrollbar مخصّص |
| **CinemaCustomCursor** | `left`/`top` + CSS `translate(-50%,-50%)` |
| **CinemaTicketCeremony** | reduced-motion يصل stage 12 · seal في زاوية QR (لا يغطيه) · FeatureMoment overlay |
| **CinemaSessionRevealPhase** | مؤقّت جلسة حي (interval) · عناوين ميزات حسب locale · عملة من i18n |
| **CinemaClosingPhase** | `ContactPage` بدل `Contact` — عرض هاتف/بريد صحيح |
| **SeatHud minimap** | CSS `.cinema-minimap-grid` / `.cinema-minimap-row` |
| **LiveTicker · OsTopBar** | `suppressHydrationWarning` · ticker ثابت SSR-safe |
| **CinemaMoviesPhase** | إزالة badge تقييم مكرّر (الملصق على الـ poster كافٍ) |

#### ج) CSS

- **`cinema-showtime-ring`** — occupancy donut
- **`cinema-feature-moment`** — fixed overlay + inline variants
- **`cinema-feature-grid`** — auto-fill · خط أكبر · `is-complete`
- **RTL:** ticker · notifications · showtime hover (`translateX(4px)`)
- **sidebar scroll** · **ticket line animation** · **ROI timeline item**

#### د) i18n

- `os.progressLabel` · `os.systemStatus` — ar / en / fr

#### هـ) فحص المتصفح (QA يدوي)

| المرحلة | النتيجة |
|---------|---------|
| boot → skip / CTA | ✅ |
| movies · showtime · rings | ✅ |
| seats 3D HUD · 2D · smart pick | ✅ |
| checkout · upsell · features | ✅ |
| ticket QR + VALID seal | ✅ |
| sessionReveal · roi · closing | ✅ |
| `npm run build` | ✅ exit 0 |

---

## 15. Commits على `ten-w/main`

| Hash | الوصف |
|------|--------|
| `146ab5b` | Cinema OS v2 — 3 modes |
| `acf693b` | Wordmark SVG + icons + immersive polish |
| `8f1e57c` | 3D hall + camera + full pass |
| `afbc387` | Premium visual — إضاءة + splash + UI |
| `97a3e9e` | Unified Cinema OS — boot → desktop → session reveal |
| *(هذا الرفع)* | UI polish — layering · hydration · RTL · QA |

---

## 16. QA checklist (Unified + Polish)

- [x] Boot POST → bars → auth → briefing → «ابدأ جلستك» / تخطي
- [x] OS chrome: progress · ticker · topbar · sound — بدون تراكب
- [x] Feature moments تُسجّل في `featuresSeen`
- [x] مقاعد 3D · fallback 2D · smart pick · minimap صفوف
- [x] Sticky bar لا يغطي status float
- [x] Ticket: QR مرئي · seal في الزاوية · reduced-motion يكمل
- [x] Session reveal: مؤقّت حي · 20 بطاقة ميزة
- [x] Closing: هاتف +963… · info@tenegta.com (ليس placeholder)
- [x] RTL ar — ticker · HUD · showtime hover
- [x] ar / en / fr builds
- [ ] hydration تحذير من layout الموقع (`SmoothScroll`) — خارج نطاق الديمو

---

*T.E.N.E.G.T.A — Cinema OS Unified Experience · Salamiya Cinema · يونيو 2026*
