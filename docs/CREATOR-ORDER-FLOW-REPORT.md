# تقرير: صفحة الطلب + كود الحسم + عمولات الصنّاع

## نظرة عامة

صفحة طلب عامة للعميل (`/order`) مع 3 باقات، ميزات ديناميكية، كود حسم 3% مرتبط بالصانع، حفظ الطلب في DB، إيميل للأدمن، ولوحة إدارة سينمائية.

**Migration:** `20260608140000_client_orders`

---

## الروابط

| الصفحة | الرابط |
|--------|--------|
| طلب العميل | https://tenegta.com/ar/order |
| طلب مع كود حسم | https://tenegta.com/ar/order?code=XXXXXX |
| إدارة الطلبات | https://tenegta.com/ar/growth/admin/orders |

---

## الباقات العامة

| المنتج | السعر الأساسي |
|--------|---------------|
| موقع إلكتروني | $4,500 |
| أتمتة وذكاء اصطناعي | $5,900 |
| تطبيق موبايل | $9,500 |

السعر يتغير حسب الميزات المختارة. عمولة الصانع تبدأ من **10%** وتزداد مع النشاط والعقود.

---

## سير العمل

1. الصانع يشارك `/order?code=XXXXXX`
2. العميل يختار باقة + ميزات + يطبّق الحسم
3. يُنشأ `ClientOrder` + `Deal` PENDING (إن وُجد صانع)
4. إيميل للأدمن + إشعار in-app للصانع
5. الأدمن يراجع في `/growth/admin/orders` ويغلق الصفقة → عمولة

---

## أمان حسابات الشركاء الحالية

| التغيير | التأثير على الشركاء الحاليين |
|---------|------------------------------|
| `clientDiscountCode` جديد (nullable) | **لا شيء** حتى يزور الصانع غرفته أو يُولَّد الكود تلقائياً |
| جدول `ClientOrder` جديد | **لا شيء** — لا يمس بيانات قديمة |
| `Product.publicVisible` | المنتجات القديمة تبقى `false` — لا تظهر في `/order` |
| عمولة 10% + boost | تُطبَّق فقط عند **إغلاق صفقات جديدة** للباقات الثلاث العامة |
| صفقات مغلقة سابقة | **لا تتغير** — `CommissionLedger` محفوظ |
| XP / مستوى / referralCode | **لا يتغير** |

---

## ملفات رئيسية

- `site/app/[locale]/order/page.tsx`
- `site/app/api/order/route.ts`
- `site/components/order/OrderPageClient.tsx`
- `site/components/growth/creators/CreatorSalesGuidePanel.tsx`
- `site/app/[locale]/growth/admin/orders/page.tsx`
- `site/lib/growth/creator-commission-boost.ts`
- `site/lib/growth/product-features.ts`
