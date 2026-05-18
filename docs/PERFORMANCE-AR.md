# سرعة موقع T.E.N.E.G.T.A (Next.js — ليس WordPress)

الموقع مبني بـ **Next.js 16** ويُشغَّل على VPS عبر **Nginx + PM2**. اقتراحات مثل LiteSpeed Cache أو إضافات WordPress **لا تنطبق** هنا. البدائل المناسبة:

| اقتراح عام | ما يعادله عندكم |
|------------|------------------|
| تخزين مؤقت (Cache) | رؤوس `Cache-Control` لـ `/_next/static` و`/images` في `next.config.ts` + cache في Nginx (انظر `scripts/nginx-tenegta-performance.conf.example`) |
| ضغط الملفات | `gzip` في Nginx + `compress: true` في Next |
| تقليل الصور / WebP | `next/image` مع `sharp` — تنسيقات AVIF/WebP تلقائياً |
| حذف إضافات غير ضرورية | لا إضافات WP؛ تقليل JS: تحميل Lenis/GSAP/cursor بشكل مؤجل، GA4 بعد الموافقة وبـ `lazyOnload` |
| خطوط أسرع | `next/font` بدل `@import` من Google Fonts |

## ما تم في الكود

- **preconnect** لـ Google Fonts + `display=swap` لتقليل تأخير الخطوط (السيرفر يبني بدون حاجب؛ `next/font` يتطلب اتصالاً عند البناء)
- **تحميل مؤجل** لـ Lenis + GSAP + المؤشر المخصص
- **تحسين الحزم**: `optimizePackageImports` لـ framer-motion وغيرها
- **صور**: إزالة `unoptimized: true` + `sharp`
- **GA4**: يُحمَّل فقط بعد قبول الكوكيز وبأولوية منخفضة

## على السيرفر (مرة واحدة)

1. طبّق مقطع Nginx من `scripts/nginx-tenegta-performance.conf.example` داخل `server { }` لـ `tenegta.com`.
2. تأكد أن `gzip on;` مفعّل (غالباً في `nginx.conf` الرئيسي).
3. بعد كل تحديث كود: `git pull` ثم `bash scripts/server-update.sh`.

## اختبار السرعة

- [PageSpeed Insights](https://pagespeed.web.dev/) — `https://tenegta.com`
- Chrome DevTools → Network: تحقق من cache لملفات `/_next/static/...`
- Lighthouse (Mobile) — ركّز على LCP وعدد طلبات JS

## تحسينات إضافية (اختياري)

- تقليل تأثيرات Three.js على الصفحة الرئيسية لزوار الجوال (`prefers-reduced-motion` مفعّل جزئياً).
- CDN أمام Nginx (Cloudflare) لـ SSL + cache عالمي للأصول الثابتة.
- رفع صور جديدة بصيغة WebP قبل وضعها في `site/public/images/`.
