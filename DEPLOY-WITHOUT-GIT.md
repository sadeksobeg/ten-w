# نشر المشروع على Netlify بدون GitHub

رفع المجلد «كما هو» من المتصفح (**Netlify Drop** / سحب وإفلات) يعمل فقط مع **مواقع HTML ثابتة**. هذا المشروع **Next.js** (صفحات ديناميكية + API) يحتاج **بناءً (build)** ثم رفع الناتج عبر **Netlify CLI** من جهازك. لا يلزم ربط GitHub.

## المتطلبات على جهازك

- [Node.js](https://nodejs.org/) 20 أو 22  
- حساب على [Netlify](https://app.netlify.com) (مجاني)

## 1) تثبيت الحزم وبناء المشروع

افتح الطرفية (Terminal) في **جذر المشروع** (المجلد الذي يحتوي على `package.json` و`netlify.toml`):

```bash
npm install
npm run build
```

إذا نجح البناء، يكون لديك مجلد **`site/.next`** (ومخرجات أخرى يحتاجها الإضافة).

## 2) تثبيت أداة Netlify CLI (مرة واحدة)

```bash
npm install -g netlify-cli
```

أو بدون تثبيت عام، استخدم `npx` عند كل أمر (موضح أدناه).

## 3) تسجيل الدخول إلى Netlify

```bash
netlify login
```

تفتح نافذة المتصفح لتأكيد الحساب.

## 4) ربط المجلد بموقع Netlify (أول مرة فقط)

**خيار أ:** أنشئ موقعاً جديداً من الواجهة ثم اربط المجلد:

```bash
cd "مسار/المجلد/الذي/فيه/netlify.toml"
netlify link
```

اتبع التعليمات واختر الموقع من حسابك.

**خيار ب:** إنشاء موقع من الطرفية:

```bash
netlify sites:create --name اسم-موقع-اختياري
netlify link
```

## 5) النشر إلى الإنتاج

من **نفس جذر المشروع** (حيث `netlify.toml`):

```bash
netlify deploy --prod
```

إذا لم تثبت CLI عالمياً:

```bash
npx netlify-cli deploy --prod
```

يقرأ Netlify ملف **`netlify.toml`** ويرفع المخرجات المناسبة لمشروع Next.js (مع الإضافة `@netlify/plugin-nextjs`).

بعدها يظهر لك رابط الموقع (مثل `https://something.netlify.app`).

## 6) تحديثات لاحقة

كلما عدّلت الكود:

```bash
npm run build
netlify deploy --prod
```

أو من جذر المشروع يمكنك تشغيل (بعد إضافة السكربت في `package.json`):

```bash
npm run deploy:netlify
```

---

## «Drag and drop your project folder, zip file, or a single HTML file» (Netlify)

هذه الميزة في Netlify ترفع الملفات **كموقع ثابت (static)** فقط: HTML وCSS وJS وصور، تُخدَّم مباشرة بدون خادم Node يشغّل Next.

| ما ترفعه | النتيجة |
|----------|---------|
| مجلد **المشروع المصدري** (مع `package.json` و`app/` وغيره) | **لن يعمل** كموقع؛ المتصفح لا ينفّذ Next. |
| مجلد **`node_modules`** أو ZIP ضخم من المصدر | **غير مناسب**؛ ليس موقعاً جاهزاً. |
| مجلد **`.next`** وحده | **ليس** موقعاً HTML جاهزاً للاستضافة الثابتة بهذه الطريقة. |
| مجلد **`out/`** بعد **`output: 'export'`** | يمكن أن يعمل مع السحب والإفلات — لكن هذا المشروع يستخدم **`/api/contact`** ووظائف سيرفر، و**لا يدعم التصدير الثابت الكامل** دون تغيير كبير (إزالة/استبدال الـ API). |

**الخلاصة:** جملة Netlify تعني «ارفع **موقعاً جاهزاً للعرض كملفات ثابتة**». مشروع Next.js **الكامل** (مع API ونفس الإعداد الحالي) لا يُبنى بهذه الصورة؛ الأنسب بدون Git هو **`netlify deploy --prod`** بعد `npm run build` كما في الأعلى.

إذا أردت لاحقاً نسخة **ثابتة فقط** للسحب والإفلات، يلزم مشروعاً منفصلاً أو تعديلات (تصدير ثابت + استبدال نموذج الاتصال بخدمة خارجية مثل Formspree أو Netlify Forms).

---

## متغيرات البيئة (اختياري)

إذا احتجت `NEXT_PUBLIC_SITE_URL` وغيرها: من Netlify → **Site configuration** → **Environment variables** → أضف القيم ثم نفّذ `netlify deploy --prod` من جديد.
