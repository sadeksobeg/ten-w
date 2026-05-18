# قائمة تحسين السرعة — T.E.N.E.G.T.A (Next.js)

الموقع **Next.js على VPS** (Nginx + PM2)، وليس WordPress. الحالة: ✅ منفّذ · 🟡 جزئي · ⬜ متبقّي.

---

## 1) الأعلى تأثيرًا

| البند | الحالة | ملاحظة |
|--------|--------|--------|
| راجع الحزم واحذف غير المستخدم | ✅ | حُذف `lottie-react` (لم يُستورد في الكود) |
| عطّل/أجّل سكريبتات خارجية | ✅ | GA4 بعد الموافقة + `lazyOnload`؛ Turnstile يُحمَّل عند صفحة التواصل فقط (chunk منفصل) |
| `next/image` لكل الصور | 🟡 | مفعّل مع `sharp`؛ معظم المحتوى SVG/بدون صور؛ صور الفريق الخارجية ما زالت `<img>` عند CDN |
| WebP/AVIF | ✅ | `formats: ['image/avif','image/webp']` في `next.config.ts` |
| `next/font` بدل الخطوط اليدوية | 🟡 | `preconnect` + أوزان أقل في Google Fonts؛ `next/font` يفشل البناء بدون إنترنت على جهاز التطوير |

---

## 2) تحسينات قوية

| البند | الحالة | ملاحظة |
|--------|--------|--------|
| Static / ISR بدل SSR | ✅ | صفحات التسويق SSG عند البناء؛ Strapi `revalidate: 3600` |
| خفّف أوزان الخطوط | ✅ | Cairo 600/700، Tajawal 400/700، Inter 400/600/700 |
| GA4 بعد الموافقة فقط | ✅ | `AnalyticsConsent.tsx` |
| أجّل Lenis / GSAP / المؤشر | ✅ | import ديناميكي داخل `useEffect` + `LazyCustomCursor` |
| Three.js في الهيرو على الجوال | ✅ | لا يُحمَّل عند `pointer: coarse` (لمس) |

---

## 3) تحسينات إضافية

| البند | الحالة | ملاحظة |
|--------|--------|--------|
| Cache headers للملفات الثابتة | ✅ | `next.config.ts` + Nginx `scripts/nginx/tenegta.com.conf` |
| تقليل re-renders | ⬜ | مراجعة يدوية لـ Growth chat / admin لاحقاً |
| أبعاد صور قبل الرفع | ⬜ | عملية محتوى — راجع `site/public/images/` |
| فحص الرئيسية — أكبر الحزم | 🟡 | Hero Three.js مؤجّل على الجوال؛ System Visualizer dynamic |

---

## 4) فحص نهائي

بعد كل دفعة تغييرات:

1. [PageSpeed Insights](https://pagespeed.web.dev/?url=https://tenegta.com/ar) — استخدم **`/ar` أو `/en`** وليس `/` فقط (الجذر يوجّه تلقائياً بعد التحديث)
2. Lighthouse (Mobile): **LCP** · **INP** · **CLS**
3. على السيرفر:
   ```bash
   ASSET=$(curl -s https://tenegta.com/en | grep -oE '/_next/static/[^"]+\.js' | head -1)
   curl -sI "https://tenegta.com$ASSET" | grep -i cache-control
   ```

---

## أوامر النشر

```bash
# جهازك
npm run push:github

# VPS
cd /var/www/tenegta && git pull && bash scripts/server-update.sh
bash scripts/server-nginx-tenegta.sh   # مرة واحدة أو عند تغيير Nginx
```

---

## حزم ثقيلة (مقصودة — لا تحذف بدون بديل)

| الحزمة | الاستخدام |
|--------|-----------|
| `three` + `@react-three/fiber` | هيرو سطح المكتب، محاكيات الحلول |
| `gsap` + `lenis` | تمرير سلس + parallax |
| `framer-motion` | حركات واجهة التسويق |
| `@sentry/nextjs` | اختياري — فقط إذا `SENTRY_DSN` مضبوط |
