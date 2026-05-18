# نشر بسيط — بدون SSH من جهازك

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

### ملف `.env` (مرة واحدة — من File Manager)

1. على جهازك افتح: `site\.env.vps.local` (بعد `npm run setup:vps`)  
2. في Hostinger: **File Manager** → `/var/www/tenegta/site/`  
3. أنشئ ملف **`.env`** والصق نفس المحتوى  
4. عدّل `AUTH_SECRET` من الملف: `scripts\vps-generated-credentials.txt`

---

## ج) كل تحديث على السيرفر

بعد `npm run push:github` من جهازك، في **Browser terminal**:

```bash
cd /var/www/tenegta
bash scripts/server-update.sh
```

هذا يسحب من GitHub ويبني ويعيد تشغيل PM2.

---

## ملخص الأوامر

| أين | الأمر |
|-----|--------|
| جهازك | `npm run push:github` |
| سيرفر (متصفح) | `bash scripts/server-update.sh` |

لا حاجة لـ `npm run deploy:vps` إذا SSH من جهازك لا يعمل.
