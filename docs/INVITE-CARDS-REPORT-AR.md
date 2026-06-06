# تقرير شامل — نظام بطاقات الدعوة (TENEGTA Invite Cards)

**التاريخ:** مايو 2026  
**المشروع:** موقع TENEGTA — `ten-w` / `tenegta.com`  
**الحالة:** مُنفَّذ ومرفوع على `main`  
**آخر commit ذي صلة:** Ceremony Edition (frontend rebuild)

---

## 14. Ceremony Edition — إعادة بناء التجربة العامة (v2)

**المرجع:** Apple Event invites، Stripe Sessions، Louis Vuitton digital، Awwwards، Pentagram.

### المبدأ
«لقد اُخترت — هذه ليست صفحة ويب، هذه مراسم.»

### التقنيات (بدون حزم جديدة)
- **CSS فقط** للأنيميشن (لا framer-motion في `/invite`)
- **Canvas** — AmbientCanvas، StarfieldCanvas، ConfettiCanvas
- **Web APIs** — AudioContext chime، IntersectionObserver، haptic vibrate
- **qrcode** — QR على ظهر البطاقة + تحميل PNG 1080×1920 client-side

### المراحل
| مرحلة | المدة/الوصف |
|-------|-------------|
| **Boot** | ~4s state machine: dark → point → gate → logo → «لديك دعوة خاصة» → curtain |
| **Card** | scroll: Hero → VIP card (3D tilt / flip mobile) → رسالة → رحلة → sigil + CTA |
| **World** | flash + confetti + «أهلاً وسهلاً» + pillars + download + tenegta.com |

### ملفات جديدة/محدّثة
```
site/components/invite/
  canvas/AmbientCanvas.tsx
  canvas/StarfieldCanvas.tsx
  canvas/ConfettiCanvas.tsx
  hooks/usePrefersReducedMotion.ts
  hooks/useIntersectionReveal.ts
  hooks/useScrollProgress.ts
  hooks/useParallax.ts
  hooks/useMediaQuery.ts
  LetterReveal.tsx
  MagneticCursor.tsx
  ScrollProgressBar.tsx
  DownloadInviteButton.tsx
  phases/BootPhase.tsx (rebuild)
  phases/CardPhase.tsx (rebuild)
  phases/WorldPhase.tsx (rebuild)
  AccessTokenCard.tsx (rebuild)
  TenegtaInviteExperience.tsx (orchestrator)
site/lib/invite/
  generate-card-canvas.ts
  invite-sound.ts
site/app/invite/invite-globals.css (Ceremony tokens)
```

### محذوف
- `InviteAmbientCanvas.tsx`
- `useInviteWorldCelebration.ts` (استُبدل بـ ConfettiCanvas)

### accessibility
- `prefers-reduced-motion`: Boot مضغوط ~1.2s (نفس المراحل)، confetti/canvas minimal
- لا تخطي Boot فوري إلى Card

### ألوان Ceremony
Gold `#C9922A` · Purple `#6B21A8` · Void `#03010A` · Surface `#0F0B1E`

---

## 1. ملخص تنفيذي

تم بناء **نظام دعوات رقمي مستقل** لدعوة صناع المحتوى والضيوف المميزين إلى عالم TENEGTA، دون المساس بحسابات الشركاء أو بيانات Growth الموجودة.

النظام يتكون من ثلاث طبقات:

| الطبقة | الوظيفة |
|--------|---------|
| **قاعدة البيانات** | جدول جديد `InviteCard` (إضافي فقط) |
| **لوحة الإدارة** | إنشاء / عرض / نسخ / حذف / تحميل QR — داخل Growth Admin |
| **التجربة العامة** | صفحة سينمائية فاخرة على `/invite/[slug]` مع قبول الدعوة |

**قرار أساسي:** قبول الدعوة يحدّث حالة `InviteCard.accepted` فقط — **لا ينشئ حساب PARTNER** ولا يغيّر كلمات مرور أو أدوار.

---

## 2. سجل التطوير (Git)

| Commit | الوصف |
|--------|--------|
| `fb353f8` | النظام الأول: Prisma، `/admin`، `/invite/[slug]`، API قبول، PNG + QR |
| `8fb33ac` | رابط «بطاقات الدعوة» في القائمة الجانبية لـ Growth Admin |
| `1bcab8a` | دمج لوحة الإدارة داخل `/ar/growth/admin/invites` بنفس تصميم Growth |
| `264936a` | إعادة تصميم كاملة للتجربة العامة — دعوة فاخرة editorial (بدون أسلوب Terminal) |

---

## 3. قاعدة البيانات

### 3.1 نموذج `InviteCard`

**الملف:** `site/prisma/schema.prisma`

| الحقل | النوع | الوصف |
|-------|-------|--------|
| `id` | String (cuid) | المعرف |
| `name` | String | اسم المدعو (يدعم العربية) |
| `handle` | String | المعرف `@username` |
| `tier` | String | الفئة (افتراضي: `CONTENT CREATOR`) |
| `scope` | String | مجال/نطاق الدعوة |
| `message` | Text | رسالة شخصية |
| `token` | String (unique) | رمز مرجعي مثل `TNGTA-GUEST-A1B2C3` |
| `slug` | String (unique) | جزء الرابط `/invite/{slug}` |
| `accepted` | Boolean | هل قبل الدعوة |
| `acceptedAt` | DateTime? | وقت القبول |
| `createdById` | String? | الأدمن الذي أنشأها (FK → User) |
| `createdAt` | DateTime | تاريخ الإنشاء |

**الفئات المتاحة (`INVITE_TIERS`):**

- `CONTENT CREATOR`
- `CREATIVE PARTNER`
- `BRAND AMBASSADOR`

### 3.2 Migration

**المسار:** `site/prisma/migrations/20260530120000_invite_cards/migration.sql`

- `CREATE TABLE InviteCard` فقط
- فهارس على `token`، `slug`، `accepted`، `createdAt`
- FK اختياري: `createdById → User.id` مع `ON DELETE SET NULL`

**ما لم يُمس:** `User.passwordHash`، `PartnerProfile`، أدوار الشركاء، صفقات، Growth events، إلخ.

### 3.3 Seed

**الملف:** `site/prisma/seed.ts`

- `upsert` لبطاقة تجريبية واحدة (إن وُجدت) — **لا يُشغَّل seed على الإنتاج** إذا وُجدت حسابات (`should-run-seed.mjs`).

---

## 4. البنية التقنية — الملفات الرئيسية

### 4.1 مكتبة الدعوات (`site/lib/invite/`)

| الملف | الدور |
|-------|-------|
| `generate.ts` | توليد `slug`، `token`، والتحقق Zod من حقول الإنشاء |
| `get-card.ts` | جلب بطاقة للعرض العام / القائمة / الإحصائيات |
| `actions.ts` | Server Actions: `createInviteCardAction`، `deleteInviteCardAction` |
| `require-admin.ts` | التحقق من جلسة ADMIN |
| `rate-limit-invite.ts` | Rate limit على API القبول |
| `safety.ts` | توثيق أن الـ migration إضافي فقط |
| `render-luxury-card-png.ts` | توليد PNG 1080×1920 مع QR للتحميل |
| `render-luxury-card.ts` | مساعدات SVG/HTML للبطاقة |

### 4.2 المسارات (Routes)

#### إدارة

| المسار | الوصف |
|--------|--------|
| `/ar/growth/admin/invites` | **اللوحة الرئيسية** — إنشاء وإدارة الدعوات |
| `/admin` | إعادة توجيه → `/ar/growth/admin/invites` |
| `/admin/login` | إعادة توجيه → Growth sign-in أو invites إن كان ADMIN |

**المكون:** `site/components/growth/admin/InviteAdminPanel.tsx`  
**الصفحة:** `site/app/[locale]/growth/admin/invites/page.tsx`

**القائمة الجانبية:** `GrowthAdminNav` — عنصر **«بطاقات الدعوة»** تحت «الشركاء».

#### عام (بدون locale)

| المسار | الوصف |
|--------|--------|
| `/invite/[slug]` | تجربة الدعوة السينمائية |
| `/invite/[slug]` not-found | صفحة خطأ عربية أنيقة |

**Middleware:** `site/middleware.ts` — استثناء `/admin` و `/invite` من i18n (بدون `/ar` أو `/en` في الرابط).

#### API

| Endpoint | Method | الوصف |
|----------|--------|--------|
| `/api/invite/[slug]/accept` | POST | قبول idempotent + rate limit |
| `/api/invite/[slug]/card` | GET | تحميل PNG + QR (ADMIN فقط) |

### 4.3 التجربة العامة (الواجهة الأمامية)

**المجلد:** `site/components/invite/`

| المكون | الدور |
|--------|-------|
| `TenegtaInviteExperience.tsx` | منسّق المراحل الثلاث |
| `phases/BootPhase.tsx` | افتتاح سينمائي: شعار TENEGTA + «لديك دعوة خاصة» |
| `phases/CardPhase.tsx` | Hero، بطاقة VIP، رسالة، مزايا، خطوات، زر قبول |
| `phases/WorldPhase.tsx` | احتفال بعد القبول + confetti + ركائز TENEGTA |
| `AccessTokenCard.tsx` | بطاقة دعوة فاخرة (chip ذهبي، foil border) |
| `InviteAmbientCanvas.tsx` | جزicles ذهبية/بنفسجية ناعمة |
| `InviteShell.tsx` + `InviteFonts.tsx` | Layout منفصل + Cairo + Cormorant Garamond |
| `useInviteWorldCelebration.ts` | confetti بعد القبول |

**Store:** `site/stores/invite-experience-store.ts` — مراحل: `boot` → `card` → `world`

**CSS:** `site/app/invite/invite-globals.css` — tokens فاخرة (ذهبي، بنفسجي، aurora)

### 4.4 تدفق تجربة المدعو

```
1. BOOT     → شعار + «لديك دعوة خاصة» (~3–4 ثوانٍ)
2. CARD     → scroll كامل:
              - Hero: «مرحباً، {الاسم}»
              - بطاقة VIP شخصية
              - رسالة TENEGTA (من حقل message)
              - 4 مزايا + 3 خطوات
              - زر «أقبل الدعوة بامتنان»
3. ACCEPT   → POST /api/invite/{slug}/accept
4. WORLD    → confetti + «أهلاً بك» + ركائز + رابط tenegta.com
```

**إمكانية الوصول:** `prefers-reduced-motion` يتخطى الأنيميشن وينتقل مباشرة للمحتوى.

---

## 5. لوحة الإدارة — ما يمكن للأدمن فعله

من **Growth Admin → بطاقات الدعوة** (`/ar/growth/admin/invites`):

1. **إنشاء دعوة:** الاسم، المعرف، الفئة، المجال، الرسالة
2. **إحصائيات:** إجمالي / مقبولة / معلّقة
3. **لكل دعوة:**
   - تحميل بطاقة QR (PNG)
   - نسخ رابط `/invite/{slug}`
   - معاينة في تبويب جديد
   - حذف

**بيانات الدخول:** نفس Growth Admin — `admin@tenegta.local` + `GROWTH_ADMIN_PASSWORD` من `site/.env`.

---

## 6. الأمان وسلامة البيانات

| البند | التفاصيل |
|-------|----------|
| **Migration** | إضافي فقط — لا UPDATE/DELETE على شركاء |
| **Seed على الإنتاج** | يُتخطى إذا وُجد أي `User` |
| **قبول الدعوة** | يحدّث `InviteCard` فقط |
| **لا PARTNER auto** | لا إنشاء `User` أو `PartnerProfile` عند Accept |
| **تحميل PNG** | يتطلب جلسة ADMIN |
| **Rate limit** | على `/api/invite/[slug]/accept` |
| **Robots** | `noindex` على `/admin` و metadata الدعوة |

---

## 7. التبعيات المضافة

**`site/package.json`:**

- `qrcode` — QR على بطاقة PNG
- `@types/qrcode`

---

## 8. النشر على السيرفر

```bash
cd /var/www/tenegta
bash scripts/server-update.sh
```

**ما يفعله السكربت:**

1. `git pull`
2. `npm ci` (يتضمن qrcode)
3. `prisma migrate deploy` — جدول `InviteCard`
4. تخطي seed إن وُجدت حسابات
5. `npm run build` + إعادة تشغيل pm2 `tenegta`

**ما لا يُنفَّذ يدوياً:**

- `npm run db:seed` على قاعدة فيها شركاء
- `prisma db push --force-reset`
- تعديل `DATABASE_URL` أو كلمات مرور الشركاء

---

## 9. الروابط المرجعية

| الغرض | الرابط |
|-------|--------|
| لوحة الإدارة | `https://tenegta.com/ar/growth/admin/invites` |
| Growth Admin | `https://tenegta.com/ar/growth/admin` |
| دعوة (مثال) | `https://tenegta.com/invite/{slug}` |
| قبول API | `POST https://tenegta.com/api/invite/{slug}/accept` |
| PNG + QR | `GET https://tenegta.com/api/invite/{slug}/card` (ADMIN) |

---

## 10. التصميم — التطور

### المرحلة الأولى (Terminal / Access Token)

- أسلوب `access_token.env`، `$ accept_invitation`
- خط Space Mono + Syne
- شبكة grid + scanlines
- لوحة `/admin` منفصلة

**ملاحظة المستخدم:** الواجهة «سيئة ولا تشبه باقي الواجهات».

### المرحلة الثانية (Growth Admin)

- نقل الإدارة إلى `/growth/admin/invites`
- نفس GlassCard وأزرار Growth
- ترجمة ar / en / fr
- رابط في القائمة الجانبية

### المرحلة الثالثة (Premium Editorial — الحالية)

**مراجع التصميم:** دعوات العلامات الفاخرة، Apple Event invites، Stripe Sessions، editorial luxury.

**خصائص:**

- خطوط Cairo + Cormorant Garamond
- Hero كامل الشاشة + scroll sections
- بطاقة VIP بحدود ذهبية
- اقتباس للرسالة الشخصية
- 4 مزايا + 3 خطوات
- زر CTA ذهبي عربي
- confetti ذهبي بعد القبول
- خلفية aurora + bokeh (بدون terminal)

---

## 11. ما لم يُنفَّذ (اختياري للمستقبل)

- [ ] صورة غلاف أو فيديو intro لكل دعوة
- [ ] إنشاء حساب PARTNER تلقائياً بعد القبول (مُستبعد بالتصميم الحالي)
- [ ] إرسال email تلقائي (ملفات `site/emails/` موجودة محلياً وغير مرفوعة)
- [ ] OG image ديناميكي لكل دعوة (metadata نصية فقط حالياً)
- [ ] تعدد اللغات في صفحة الدعوة (الواجهة عربية RTL افتراضياً)

---

## 12. قائمة الملفات (مرجع سريع)

```
site/
├── prisma/
│   ├── schema.prisma                    # InviteCard model
│   ├── migrations/20260530120000_invite_cards/
│   └── seed.ts
├── lib/invite/
│   ├── actions.ts
│   ├── generate.ts
│   ├── get-card.ts
│   ├── rate-limit-invite.ts
│   ├── require-admin.ts
│   ├── safety.ts
│   ├── render-luxury-card.ts
│   └── render-luxury-card-png.ts
├── app/
│   ├── invite/
│   │   ├── layout.tsx
│   │   ├── invite-globals.css
│   │   └── [slug]/page.tsx
│   ├── admin/                           # redirects only
│   ├── api/invite/[slug]/accept/
│   ├── api/invite/[slug]/card/
│   └── [locale]/growth/admin/invites/page.tsx
├── components/
│   ├── growth/admin/InviteAdminPanel.tsx
│   └── invite/                          # public experience
└── stores/invite-experience-store.ts
```

---

## 13. خلاصة

نظام بطاقات الدعوة يوفّر:

1. **مسار إداري آمن** داخل Growth Admin دون مسّ الشركاء  
2. **رابط دعوة شخصي** `/invite/{slug}` بتجربة فاخرة حديثة  
3. **بطاقة PNG + QR** للمشاركة خارج الموقع  
4. **قبول idempotent** مع rate limiting  
5. **نشر آمن** عبر migration إضافية وseed محمي  

للأسئلة التشغيلية: راجع أيضاً `docs/DEPLOY-SIMPLE.md` و `scripts/server-update.sh`.

---

*تم إعداد هذا التقرير بناءً على حالة المشروع بعد Ceremony Edition rebuild.*
