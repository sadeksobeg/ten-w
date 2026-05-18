# نشر من جهازك — بدون تعديل ملفات على السيرفر

المستودع: [github.com/sadeksobeg/ten-w](https://github.com/sadeksobeg/ten-w)

السيرفر يستقبل فقط: `git pull` + ملف `.env` يُرفع تلقائياً من جهازك.

---

## مرة واحدة على السيرفر (إعداد أولي فقط)

```bash
mkdir -p /var/www/tenegta
cd /var/www/tenegta
git clone https://github.com/sadeksobeg/ten-w.git .

# PostgreSQL (مرة واحدة)
sudo -u postgres psql <<'SQL'
CREATE USER tenegta_user WITH PASSWORD 'Tenegta2025Secure';
CREATE DATABASE tenegta_db OWNER tenegta_user;
GRANT ALL PRIVILEGES ON DATABASE tenegta_db TO tenegta_user;
SQL

npm install -g pm2
```

بعد ذلك **لا حاجة لـ nano** على السيرفر.

---

## مرة واحدة على جهازك (Windows)

من مجلد المشروع `TENEGTA WEBSITE`:

```powershell
# 1) إعداد الاتصال بالسيرفر
copy scripts\deploy-vps.config.example.json scripts\deploy-vps.config.json
# عدّل host إلى IP السيرفر (مثلاً عنوان srv1640110)

# 2) ملف البيئة محلياً (لا يُرفع إلى Git)
copy site\.env.vps.example site\.env.vps.local

# 3) AUTH_SECRET
openssl rand -base64 32
# الصق الناتج في AUTH_SECRET داخل site\.env.vps.local

# 4) عدّل في .env.vps.local:
#    FORMSPREE_ENDPOINT، GROWTH_ADMIN_PASSWORD، GROWTH_DEMO_PASSWORD
```

---

## كل نشر (من جهازك فقط)

```powershell
cd "D:\Sadek Company\TENEGTA WEBSITE"
npm run deploy:vps
```

السكربت يقوم تلقائياً بـ:

1. `git push` إلى GitHub (`ten-w`)
2. رفع `site/.env.vps.local` → `/var/www/tenegta/site/.env`
3. على السيرفر: `git pull` → `npm ci` → `check:env` → `prisma migrate` → `build` → `pm2 restart`

---

## Nginx (مرة واحدة على السيرفر)

```nginx
location / {
    proxy_pass http://127.0.0.1:3100;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

```bash
sudo certbot --nginx -d tenegta.com -d www.tenegta.com
```

---

## ملفات محلية (لا تُرفع لـ Git)

| ملف | الغرض |
|-----|--------|
| `site/.env.vps.local` | أسرار الإنتاج — يُرفع بالسكربت فقط |
| `scripts/deploy-vps.config.json` | IP المستخدم SSH |

---

## استكشاف الأخطاء

```bash
# على السيرفر (قراءة فقط)
pm2 logs tenegta
curl -I http://127.0.0.1:3100
```
