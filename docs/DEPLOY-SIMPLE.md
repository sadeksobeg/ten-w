# نشر بسيط — بدون SSH من جهازك

> **سيرفر مشترك مع تطبيق آخر؟** راجع **[DEPLOY-ISOLATED.md](./DEPLOY-ISOLATED.md)** — قاعدة `tenegta_db` ومنفذ `3100` وNode داخل المشروع فقط.

إذا **لا يعمل SSH من الكمبيوتر**، استخدم طريقتين فقط:

1. **من جهازك:** رفع الكود إلى GitHub  
2. **من المتصفح (Hostinger):** سحب الكود وبناء الموقع على السيرفر  

---

## أ) من جهازك (Windows)

```powershell
cd "D:\Sadek Company\TENEGTA WEBSITE"

# مرة واحدة — يولّد الأسرار محلياً
npm run setup:vps

# كل تحديث — رفع الكود فقط (بدون اتصال بالسيرفر)
npm run push:github
```

---

## ب) على السيرفر (مرة واحدة — إعداد)

افتح **Hostinger hPanel** → **VPS** → **Browser terminal** (أو SSH من المتصفح).

```bash
mkdir -p /var/www/tenegta
cd /var/www/tenegta
git clone https://github.com/sadeksobeg/ten-w.git .

# قاعدة البيانات (مرة واحدة)
sudo -u postgres psql <<'SQL'
CREATE USER tenegta_user WITH PASSWORD 'Tenegta2025Secure';
CREATE DATABASE tenegta_db OWNER tenegta_user;
GRANT ALL PRIVILEGES ON DATABASE tenegta_db TO tenegta_user;
SQL

npm install -g pm2
```

### ملف `.env`

يُنشأ **تلقائياً** عند أول تشغيل لـ `server-update.sh` (لا حاجة لنسخ من جهازك).

كلمات المرور تُحفظ على السيرفر في:

`scripts/server-generated-credentials.txt`

```bash
cat /var/www/tenegta/scripts/server-generated-credentials.txt
```

### نموذج الاتصال — Mailcow SMTP (موصى به)

1. في **Mailcow** → `https://mail.tenegta.com/user` → **App passwords** → أنشئ كلمة مرور للتطبيق.
2. على السيرفر عدّل `/var/www/tenegta/site/.env`:

```env
SMTP_HOST="127.0.0.1"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="info@tenegta.com"
SMTP_PASS="كلمة-مرور-التطبيق-من-mailcow"
CONTACT_EMAIL_TO="info@tenegta.com"
SMTP_FROM="TENEGTA Website <info@tenegta.com>"
```

استخدم **App password** من Mailcow (ليس كلمة دخول SOGo). إن فشل الإرسال مع `127.0.0.1`، جرّب `SMTP_HOST="mail.tenegta.com"` أو راجع `bash scripts/server-pm2.sh logs tenegta` لسطر `[contact] SMTP failed`.

(احذف أو علّق `FORMSPREE_ENDPOINT` إن لم تعد تحتاج Formspree.)

3. أعد التشغيل:

```bash
cd /var/www/tenegta
bash scripts/server-pm2.sh restart tenegta
```

4. اختبر: `https://tenegta.com/ar/contact` — يجب أن تصل الرسالة إلى `info@tenegta.com`.

**ملاحظة:** لتحسين وصول Gmail (تقليل Spam) أصلح PTR IPv4 و AAAA لـ `mail` كما في إعداد البريد.

### Mailcow + الموقع على نفس VPS (تعارض 443)

إذا `tenegta.com` يعرض **404 nginx** بعد تثبيت Mailcow:

```bash
cd /var/www/tenegta
git pull origin main
sudo bash scripts/server-mailcow-reverse-proxy.sh
sudo bash scripts/server-nginx-tenegta.sh
sudo bash scripts/server-nginx-mail.sh
# إن لم توجد شهادة: sudo certbot certonly --webroot -w /var/www/certbot -d mail.tenegta.com -d autodiscover.tenegta.com -d autoconfig.tenegta.com
sudo systemctl start nginx
curl -sI https://tenegta.com/ar | head -5
```

السكربت يعلّق `HTTP_PORT=80` / `HTTPS_PORT=443` المكررة في `mailcow.conf` ويبقي `8080`/`8443` على `127.0.0.1`.

---

## ج) كل تحديث على السيرفر

بعد `npm run push:github` من جهازك، في **Browser terminal**:

```bash
cd /var/www/tenegta
git pull origin main
bash scripts/server-update.sh
# اختياري بعد تحديث SEO/nginx:
# bash scripts/server-nginx-tenegta.sh && bash scripts/server-seo-verify.sh
```

هذا يسحب من GitHub، يثبت Node 20 إن لزم، يضبط قاعدة `tenegta_db`، يبني ويعيد تشغيل PM2.

**مهم:** على السيرفر لا تضبط `export DATABASE_URL=...clinicsaas` في الطرفية — يجب أن يبقى الاتصال في `site/.env` فقط على قاعدة **`tenegta_db`**. السكربت يمسح متغير الشل تلقائياً ويرفض تعديل قواعد تطبيقات أخرى.

إذا ظهر خطأ Prisma **P3005** — أنشئ قاعدة `tenegta_db` من Hostinger ثم أعد `server-update.sh` (بدون `db push` على `clinicsaas`).

### Growth Engine (بعد تحديث 0003)

الترحيل `site/prisma/migrations/0003_growth_extensions` يُطبَّق تلقائياً مع `server-update.sh` (`prisma migrate deploy`).

**بيانات تجريبية (اختياري — يمسح بيانات Growth القديمة):**

```bash
cd /var/www/tenegta/site
npx prisma db seed
```

| الدور | البريد | كلمة المرور الافتراضية (seed) |
|------|--------|-------------------------------|
| **أدمن** | `admin@tenegta.local` | `ChangeMeAdmin!123` أو `GROWTH_ADMIN_PASSWORD` في `.env` |
| **شريك تجريبي** | `partner@tenegta.local` | `ChangeMePartner!123` أو `GROWTH_DEMO_PASSWORD` |

**مسارات جديدة:**

- لوحة الأدمن: `/ar/growth/admin` — شركاء، فعاليات، إشعارات
- الشريك: `/ar/growth` — فعاليات، دردشة، جرس إشعارات
- بروفايل عام (للمشاركة/QR لاحقاً): `/ar/growth/profile/{publicSlug}` — مثال بعد seed: `/ar/growth/profile/demo-partner`

في الإنتاج غيّر كلمات المرور عبر `GROWTH_ADMIN_PASSWORD` و`GROWTH_DEMO_PASSWORD` في `site/.env` ولا تعتمد على القيم الافتراضية.

---

## ملخص الأوامر

| أين | الأمر |
|-----|--------|
| جهازك | `npm run push:github` |
| سيرفر (متصفح) | `bash scripts/server-update.sh` |

لا حاجة لـ `npm run deploy:vps` إذا SSH من جهازك لا يعمل.

### أوامر مفيدة على السيرفر

```bash
bash scripts/server-status.sh          # تشخيص المنفذ وPM2
bash scripts/server-pm2.sh logs tenegta
bash scripts/server-restart.sh       # إعادة تشغيل كاملة (يحرّر المنفذ 3100)
bash scripts/server-pm2.sh restart tenegta
```

`pm2` من النظام قد لا يعمل — استخدم دائماً `bash scripts/server-pm2.sh`.

---

## سرعة الموقع

الموقع **Next.js** وليس WordPress — لا تستخدم LiteSpeed Cache أو إضافات WP.

راجع **[PERFORMANCE-AR.md](./PERFORMANCE-AR.md)**. لتثبيت Nginx (gzip + cache + SSL → :3100):

```bash
cd /var/www/tenegta
git pull origin main
bash scripts/server-nginx-tenegta.sh
```

---

## فهرسة Google (SEO)

بعد أي تحديث يمسّ الروابط أو `sitemap` أو `robots`:

```bash
cd /var/www/tenegta
git pull origin main
bash scripts/server-nginx-tenegta.sh   # إن تغيّر nginx (www، HSTS، إلخ)
bash scripts/server-update.sh
bash scripts/server-seo-verify.sh      # تحقق سريع من 301 و hreflang
```

### مرة واحدة — Search Console

1. [Google Search Console](https://search.google.com/search-console) → إضافة **نطاق** `tenegta.com` (تحقق DNS TXT).
2. إرسال خريطة الموقع: `https://tenegta.com/sitemap.xml`
3. **فحص عنوان URL** → طلب فهرسة لـ `/ar` و `/en` و `/fr`
4. بعد 48–72 ساعة: تبويب **التغطية** (أخطاء الزحف / «تم الزحف - غير مفهرس»)

إن ظهر تحذير **تصيد** على `/growth/sign-in`: منطقة Growth للشركاء فقط — ليست في sitemap و`robots` يمنع `/growth/`. بعد `server-update.sh` اطلب **مراجعة** من GSC → الأمان.

### تحقق يدوي على السيرفر

```bash
curl -sI https://tenegta.com/ | grep -i location          # يجب: /ar
curl -s https://tenegta.com/ar | grep -i canonical
curl -s https://tenegta.com/sitemap.xml | head -25
```

**ملاحظة:** `tenegta.tech` منتج منفصل (ClinicSaaS) — لا يشارك الفهرسة مع `.com`؛ اربطهما في المحتوى أو علامة «من T.E.N.E.G.T.A» إن أردت توحيد العلامة.

---

## الموقع لا يفتح مع VPN

**الكود وNginx في المشروع لا يحجب VPN.** إذا الموقع يعمل بدون VPN ويتوقف معه، السبب غالباً خارج التطبيق:

| السبب الشائع | ماذا تفعل |
|--------------|-----------|
| **جدار Hostinger** | hPanel → **Security** → **Firewall** — تأكد أن **80** و **443** مفتوحان لجميع IPs (ليس دولة واحدة فقط). |
| **fail2ban** | على السيرفر: `fail2ban-client status` — إن حُظر IP الـ VPN: `fail2ban-client unban <IP>`. |
| **DNS الـ VPN** | جرّب في إعدادات VPN: **DNS عادي** أو **1.1.1.1** بدل DNS مدمج الـ VPN. |
| **IPv6** | بعض VPNs تكسر IPv6 — عطّل IPv6 مؤقتاً على الجهاز أو جرّب VPN آخر. |
| **منفذ 3100 مكشوف** | الموقع يجب أن يمر عبر **443 فقط**؛ لا تفتح 3100 في الجدار للعامة. |

### من جهازك (مع VPN شغّال)

1. `ping tenegta.com` — هل يوجد رد؟
2. المتصفح: `https://tenegta.com/ar` — ما رسالة الخطأ؟ (timeout / SSL / 403 / DNS_PROBE)
3. [https://www.ssllabs.com/ssltest/analyze.html?d=tenegta.com](https://www.ssllabs.com/ssltest/analyze.html?d=tenegta.com) — للتحقق من الشهادة من خارج سوريا/المنطقة

### على السيرفر

```bash
bash scripts/server-diagnose-access.sh
```

إذا `curl https://tenegta.com/ar` من السيرفر **200** لكن من VPN **لا** → المشكلة شبكة/جدار/مزود VPN وليس Next.js.
