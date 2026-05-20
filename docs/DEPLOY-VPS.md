# نشر VPS

> **SSH من جهازك لا يعمل** استخدم **[DEPLOY-SIMPLE.md](./DEPLOY-SIMPLE.md)** — `npm run push:github` + `bash scripts/server-update.sh` في متصفح Hostinger.

---

# نشر VPS من جهازك (يتطلب SSH) — بدون تعبئة يدوية

## أمر واحد (يولّد كل شيء + يرفع + يبني)

```powershell
cd "D:\Sadek Company\TENEGTA WEBSITE"
npm run vps
```

يفعل تلقائياً:

1. **`setup:vps`** — يولّد `AUTH_SECRET`، كلمات مرور Growth، `site/.env.vps.local`، `scripts/deploy-vps.config.json`
2. **`deploy:vps`** — push إلى GitHub، رفع `.env`، `git pull` + build + PM2 على السيرفر

كلمات المرور تُحفظ في: **`scripts/vps-generated-credentials.txt`** (محلي فقط، لا يُرفع لـ Git).

---

## إعداد السيرفر لأول مرة (اختياري — عبر SSH)

إذا السيرفر فارغ (Node / PostgreSQL / PM2):

```powershell
npm run setup:vps -- --bootstrap
npm run deploy:vps
```

أو معاً:

```powershell
npm run setup:vps -- --bootstrap
npm run vps
```

---

## تغيير IP السيرفر فقط

عدّل `scripts/setup-vps.defaults.json` → `"host": "عنوان-IP"` ثم:

```powershell
npm run setup:vps
npm run deploy:vps
```

أو مرة واحدة:

```powershell
npm run setup:vps -- --host 203.0.113.10
```

---

## Formspree حقيقي (اختياري — لاحقاً)

```powershell
npm run setup:vps
# أو Formspree: npm run setup:vps -- --formspree mknnvgep
npm run deploy:vps
```

الافتراضي: كتلة **Mailcow SMTP** في `.env` — ضع `SMTP_PASS` (App password) على السيرفر.  
Formspree: استبدل `mknnvgep` بمعرّف النموذج من formspree.io.

بدون Formspree يُستخدم `httpbin.org` للتحقق من النشر فقط — نموذج الاتصال لن يصلك إيميلات حقيقية حتى تضيف Formspree.

---

## القيم الافتراضية

في `scripts/setup-vps.defaults.json`:

| الحقل | الافتراضي |
|-------|-----------|
| host | `srv1640110` |
| domain | `tenegta.com` |
| DATABASE_URL | PostgreSQL محلي على السيرفر |
| PORT | `3100` |

---

## Nginx (مرة واحدة على السيرفر)

```nginx
location / {
    proxy_pass http://127.0.0.1:3100;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

```bash
sudo certbot --nginx -d tenegta.com -d www.tenegta.com
```
