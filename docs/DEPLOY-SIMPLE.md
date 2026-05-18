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

---

## ج) كل تحديث على السيرفر

بعد `npm run push:github` من جهازك، في **Browser terminal**:

```bash
cd /var/www/tenegta
git pull origin main
bash scripts/server-update.sh
```

هذا يسحب من GitHub، يثبت Node 20 إن لزم، يضبط قاعدة `tenegta_db`، يبني ويعيد تشغيل PM2.

**مهم:** على السيرفر لا تضبط `export DATABASE_URL=...clinicsaas` في الطرفية — يجب أن يبقى الاتصال في `site/.env` فقط على قاعدة **`tenegta_db`**. السكربت يمسح متغير الشل تلقائياً ويرفض تعديل قواعد تطبيقات أخرى.

إذا ظهر خطأ Prisma **P3005** — أنشئ قاعدة `tenegta_db` من Hostinger ثم أعد `server-update.sh` (بدون `db push` على `clinicsaas`).

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
