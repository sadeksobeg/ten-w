# تقرير — ديمو نظام سينما سلمية (Cinema OS Demo)

**التاريخ:** يونيو 2026  
**المشروع:** TENEGTA Website — `ten-w` / `tenegta.com`  
**الحالة:** polish مكتمل — جاهز للرفع  
**المسار:** `/ar/demo/cinema` · `/en/demo/cinema` · `/fr/demo/cinema`

---

## 1. ملخص تنفيذي

ديمو تفاعلي **full-screen** يحاكي نظام تشغيل سينمائي حقيقي لـ **سينما سلمية** — حجز أفلام، مواعيد، خريطة مقاعد، إصدار تذكرة QR، ولمحة لوحة تشغيل — **بدون قاعدة بيانات** و**بدون المساس** بحسابات الشركاء أو Growth.

يعرض قدرة **T.E.N.E.G.T.A** على بناء تجربة حجز سينمائي متكاملة (Kiosk / Web) ضمن الهوية البصرية للعميل.

---

## 2. الرابط والنشر

| البيئة | الرابط |
|--------|--------|
| إنتاج | `https://tenegta.com/ar/demo/cinema` |
| محلي | `http://localhost:3000/ar/demo/cinema` |

**النشر على السيرفر:**

```bash
bash scripts/server-update.sh
```

**robots:** الصفحة `noindex` — مخصصة للعروض والعملاء، وليست SEO عام.

---

## 3. مسار التجربة (User Journey)

```
Splash (افتتاح) → أفلام → مواعيد → مقاعد → checkout → تذكرة + QR → لوحة تشغيل
```

| المرحلة | `phase` في Store | الوصف |
|---------|------------------|--------|
| افتتاح | `splash` | لوغو مقصوص، أنيميشن boot، CTA |
| أفلام | `movies` | 3 أفلام مع **بوسترات حقيقية** |
| مواعيد | `showtime` | أوقات + قاعة IMAX/VIP + خلفية البوستر |
| مقاعد | `seats` | 8 صفوف، VIP، ذوي همم، شريط سعر ثابت |
| تأكيد | `checkout` | ملخص + اسم اختياري |
| تذكرة | `ticket` | QR + confetti + إحصائيات تشغيل |

---

## 4. الهوية البصرية

| العنصر | القيمة |
|--------|--------|
| أصفر سلمية | `#F5C518` |
| خلفية نظام | `#03010A` |
| لوغو مقصوص | `/demo/salamiya-cinema-mark.png` |
| flat-lay (احتياط) | `/demo/salamiya-cinema-logo.png` |
| TENEGTA accent | `#C9922A` · `#6B21A8` |

**الافتتاح:** خلفية صفراء + wordmark فقط (ليس الصورة الكاملة مع popcorn/clapperboard).

**باقي المراحل:** وضع dark cinematic + particles + grain.

---

## 5. تقنيات الحرفية (Craft)

### 5.1 إخفاء الماوس (Kiosk mode)

- `CinemaDemoChrome` يضيف `cinema-demo-active` على `<html>` و `<body>`
- CSS: `cursor: none !important` على كل العناصر
- إخفاء `CustomCursor` الخاص بالموقع أثناء الديمو

### 5.2 الأنيميشن

- Boot splash: logo scale-in، shimmer على الزر، loader dots
- Ambient: glow drift، rising particles، film grain
- Cards: hover scale + poster shine sweep
- Seats: pop animation عند الاختيار، screen pulse
- Ticket: slide-in + confetti + QR flash
- Dashboard stats: staggered reveal
- `prefers-reduced-motion`: تعطيل الحركة الثقيلة

### 5.3 بوسترات الأفلام

| فيلم | الملف |
|------|-------|
| كثيب: جزء ثالث | `/demo/posters/dune.jpg` |
| ليلة كوميديا | `/demo/posters/comedy.jpg` |
| أرض الأحلام | `/demo/posters/drama.jpg` |

مكوّن `CinemaMoviePoster` — `next/image` + `object-fit: cover` + badge التصنيف.

### 5.4 خريطة المقاعد

- **8 صفوف** (A–H)
- تخطيط: `3 | ممر | 6 | ممر | 3` = 12 مقعد/صف
- VIP: الصفوف A–B (20,000 ل.س)
- Standard: 15,000 ل.س
- Wheelchair: الصف H
- Occupied: hash حتمي من `showtimeId + seatId`

---

## 6. بنية الملفات

```
site/
├── app/[locale]/demo/cinema/
│   ├── layout.tsx          # full-screen shell + Chrome
│   ├── page.tsx            # metadata + experience
│   └── cinema-demo.css     # كل الأنيميشن والتنسيق
├── components/cinema-demo/
│   ├── CinemaDemoExperience.tsx
│   ├── CinemaDemoChrome.tsx      # cursor hide
│   ├── CinemaAmbientLayer.tsx    # particles + glow
│   ├── CinemaDemoHeader.tsx
│   ├── CinemaMoviePoster.tsx
│   ├── CinemaSeatMap.tsx
│   ├── CinemaConfetti.tsx
│   ├── CinemaProgressSteps.tsx
│   └── phases/
│       ├── CinemaSplashPhase.tsx
│       ├── CinemaMoviesPhase.tsx
│       ├── CinemaShowtimePhase.tsx
│       ├── CinemaSeatsPhase.tsx
│       ├── CinemaCheckoutPhase.tsx
│       └── CinemaTicketPhase.tsx
├── lib/cinema-demo/
│   ├── data.ts             # أفلام، مواعيد، brand
│   └── seat-map.ts         # generator
├── stores/cinema-demo-store.ts   # Zustand
├── public/demo/
│   ├── salamiya-cinema-mark.png
│   ├── salamiya-cinema-logo.png
│   └── posters/*.jpg
└── messages/{ar,en,fr}.json      # namespace CinemaDemo
```

---

## 7. الحالة (Zustand)

```typescript
phase: splash | movies | showtime | seats | checkout | ticket
movieId, showtimeId, selectedSeatIds[], guestName, bookingRef
```

- `selectMovie` → showtime
- `selectShowtime` → seats
- `toggleSeat` → max 6
- `confirmBooking` → ticket + ref `SLM-XXXXXX`

---

## 8. ما لم يُلمس

- `PartnerProfile` / `User` roles
- جداول Growth
- نظام الدعوات `/invite`
- أي commit لـ `site/emails/`

---

## 9. i18n

Namespace: **`CinemaDemo`** في `ar.json` · `en.json` · `fr.json`

---

## 10. CTA نهاية التجربة

زر **«اطلب عرضاً مخصصاً»** → `/contact?intent=demo&topic=cinema`

---

## 11. تطوير مستقبلي (اختياري)

- [ ] كلمة مرور / رابط خاص للعميل
- [ ] أفلام وأسعار من لوحة admin
- [ ] ربط API box office حقيقي
- [ ] نسخة EN للوغو «Salamiya» في header
- [ ] صوت ambient خفيف (مع mute)

---

## 12. Commits ذات صلة

| Commit | الوصف |
|--------|--------|
| `446467b` | الإطلاق الأول — ديمو تفاعلي |
| *(latest)* | polish — لوغو مقصوص، posters، animations، cursor hide |

---

*T.E.N.E.G.T.A — Smart Cinema OS Demo · Salamiya Cinema*
