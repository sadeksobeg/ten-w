# ملخص تنفيذ موقع T.E.N.E.G.T.A

هذا الملف يلخص ما تم بناؤه في المشروع (المجلد `site/`) وفق الخطة والمواصفات التقنية.

---

## 1. المكدس التقني

| الطبقة | الاختيار |
|--------|-----------|
| الإطار | Next.js 16 (App Router) + React 19 |
| الأنماط | Tailwind CSS v4 |
| الترجمة / RTL | `next-intl` v4، مسارات `app/[locale]`، العربية افتراضياً (`ar`) والإنجليزية (`en`) |
| التحقق من النماذج (API) | `zod` |
| الرسوم المتحركة | GSAP (استيراد ديناميكي في Hero)، `lottie-react` + ملف JSON مدمج |
| CMS (اختياري) | Strapi عبر `STRAPI_URL`؛ بدون CMS يُستخدم محتوى احتياطي في `lib/fallback-data.ts` |

---

## 2. هيكل المشروع الرئيسي

- **`app/layout.tsx`** — تمرير `children` فقط (الـ`html`/`body` في تخطيط اللغة).
- **`app/[locale]/layout.tsx`** — `lang` و`dir` (RTL للعربية)، خطوط Cairo / Tajawal / Inter، `NextIntlClientProvider`، رأس وتذييل، رابط تخطي للمحتوى، **Google Analytics اختياري** (`NEXT_PUBLIC_GA_MEASUREMENT_ID`).
- **`app/[locale]/`** — صفحات الموقع لكل لغة.
- **`middleware.ts`** — توجيه i18n عبر `next-intl`.
- **`i18n/`** — `routing.ts`, `request.ts`, `navigation.ts`.
- **`messages/ar.json`**, **`messages/en.json`** — نصوص الواجهة والـ meta النصية.
- **`components/`** — `layout/` (Header, Footer, LocaleSwitcher)، `ui/`، `home/` (Hero, HeroMotion, HeroDecor, HeroLottie)، `contact/ContactForm`، `analytics/GoogleAnalytics`، `jsonld/OrganizationJsonLd`.
- **`lib/`** — `strapi.ts`, `fallback-data.ts`, `site.ts`, `metadata-helpers.ts`.
- **`data/hero-lottie.json`** — رسوم Lottie مدمجة (بدون طلب `/lottie/hero.json` لتفادي 404).
- **`app/api/contact/route.ts`** — استقبال نموذج الاتصال ( honeypot، اختياري `CONTACT_WEBHOOK_URL`).
- **`app/sitemap.ts`**, **`app/robots.ts`** — SEO.
- **`cms/README.md`** — وصف حقول Strapi المقترحة للمشاريع والمقالات.
- **`.env.example`** — متغيرات البيئة الموثقة.

---

## 3. الصفحات المنفذة

| المسار (بعد `/ar` أو `/en`) | الوصف |
|------------------------------|--------|
| `/` | الرئيسية: Hero، خدمات، مشاريع مختارة، نموذج اتصال، JSON-LD منظمة |
| `/about` | من نحن، رؤية، تمييز، خط زمني |
| `/solutions` | أقسام AI، أمن، برمجيات، بنية تحتية، تحول رقمي + CTA |
| `/contact` | نموذج + معلومات + واتساب اختياري |
| `/projects` | قائمة مشاريع |
| `/projects/[slug]` | تفاصيل مشروع (تحدي / حل / نتائج) |
| `/pilots` | المختبرات والنماذج |
| `/tech-stack` | شارات تقنيات + قسم منصة |
| `/team` | بطاقات فريق (بيانات احتياطية) |
| `/careers` | وظائف + JSON-LD وظائف |
| `/investors` | مستثمرون (نص قابل للتوسعة) |
| `/blog` | قائمة مقالات |
| `/blog/[slug]` | مقال + JSON-LD مقال |
| `/legal` | روابط للخصوصية والشروط |
| `/privacy`, `/terms` | صفحات قانونية أولية |

لكل صفحة تقريباً: **`generateMetadata`** مع عنوان ووصف و **`alternates`** للغات.

---

## 4. التصميم وUX

- ألوان: خلفية `#121212`، ذهبي `#C9A061` / `#FFD700` في `globals.css` و`@theme`.
- خطوط عربية/لاتينية عبر `next/font`.
- رأس متجاوب + قائمة همبرغر + مبدّل لغة AR/EN.
- تذييل: روابط قانونية واتصال؛ **LinkedIn و X اختياريان** (`NEXT_PUBLIC_SOCIAL_LINKEDIN`, `NEXT_PUBLIC_SOCIAL_X`).
- **`prefers-reduced-motion`** في CSS ولـ GSAP/Lottie حيث ينطبق.

---

## 5. النماذج والأمان

- نموذج الاتصال: حقول الاسم، البريد، الشركة، الرسالة؛ **حقل honeypot** (`companyWebsite`).
- API: رفض الطلبات إذا مُلئ الـ honeypot؛ إعادة JSON؛ إعادة توجيه اختياري عبر `CONTACT_WEBHOOK_URL`.
- **`next.config.ts`**: رؤوس `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

---

## 6. إعدادات البناء على Windows

- **`package.json`**:  
  - `"dev": "next dev --webpack"`  
  - `"build": "next build --webpack"`  
  السبب: عند غياب الحزمة الأصلية `@next/swc-win32-x64-msvc`، Turbopack غير مدعوم؛ Webpack يعمل مع WASM.
- تحذير Next 16 حول **middleware → proxy**: ما زال المشروع يستخدم `middleware.ts` مع `next-intl` (سلوك متوقع حتى تحديث التوثيق/المكتبة).

---

## 7. إصلاحات لاحقة

- **404 لـ `/lottie/hero.json`**: تم إلغاء `fetch` للملف العام واستبداله باستيراد **`data/hero-lottie.json`** داخل `HeroLottie.tsx`.

---

## 8. التشغيل والنشر

```bash
cd site
npm install
npm run dev
```

- تطوير: `http://localhost:3000` → إعادة توجيه للغة (مثلاً `/ar`).
- إنتاج: `npm run build` ثم `npm start`.
- نسخ `.env.example` إلى `.env.local` وضبط `NEXT_PUBLIC_SITE_URL` للـ canonical وsitemap.

**Vercel (واجهة):** جذر المشروع = مجلد `site` (أو ضبط Root Directory في لوحة Vercel).

**Strapi:** راجع `site/cms/README.md` و`STRAPI_URL` + `STRAPI_API_TOKEN`.

**QA:** سكربت تذكيري `npm run test:a11y` → `scripts/a11y-note.mjs` (Lighthouse / axe يدوياً).

---

## 9. ما لم يُدمج ككود كامل (مرحلة لاحقة حسب الخطة)

- PWA (`next-pwa` / Workbox).
- Three.js في صفحة معزولة.
- Turnstile / hCaptcha في نموذج الاتصال.
- خريطة Google Maps تفاعلية في صفحة الاتصال.
- CI/CD (GitHub Actions) واختبارات Playwright/axe آلية.
- صفحات تفصيلية اختيارية لكل حل تحت `/solutions/[slug]`.

---

*آخر تحديث للملخص: يعكس حالة المستودع بعد التنفيذ والإصلاحات أعلاه.*
