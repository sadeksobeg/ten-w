# نشر TENEGTA معزول — بدون المساس بنظامك الآخر

كل شيء لهذا الموقع **منفصل** عن التطبيق الآخر على نفس السيرفر.

| العنصر | TENEGTA فقط | لا يمس |
|--------|-------------|--------|
| مجلد الملفات | `/var/www/tenegta` | تطبيقات أخرى |
| قاعدة البيانات | `tenegta_db` | `clinicsaas` أو غيرها |
| مستخدم DB | `tenegta_user` | مستخدمي DB الآخرين |
| منفذ التطبيق | `3101` في `site/.env` (أو `3100` إن لم يُغيّر) | `3000` (clinicsaas)، `3100` (whatsapp-bridge) |
| PM2 | اسم `tenegta` فقط | عمليات pm2 الأخرى |
| Node | ` /var/www/tenegta/.nvm` (Node 20) | Node النظام للتطبيق الآخر |
| ملف البيئة | `/var/www/tenegta/site/.env` | `.env` التطبيق الآخر |
| Nginx | `tenegta.com` → `127.0.0.1:` + `PORT` من `.env` | دومينات/منافذ التطبيق الآخر |

### خريطة المنافذ (سيرفر مشترك — مثال srv1640110)

| المنفذ | الخدمة | لا تمس |
|--------|--------|--------|
| **3101** | TENEGTA (PM2 `tenegta`) | — |
| **3100** | clinic-os `whatsapp-bridge` | **لا تقتل** — ليس tenegta |
| **3000** | clinicsaas | التطبيق الآخر |

لفحص tenegta: `curl http://127.0.0.1:3101/ar` — **ليس** `:3100`.

---

## ماذا تفعل الآن (على السيرفر — Browser terminal)

```bash
cd /var/www/tenegta
git pull origin main

# تأكد أن .env يخص tenegta فقط (يصلح clinicsaas إن وُجد في هذا الملف فقط)
bash scripts/server-ensure-db.sh

# بناء وتشغيل (Node 20 محلي داخل المشروع)
bash scripts/server-update.sh
```

---

## Nginx لـ tenegta.com فقط (لا تغيّر config التطبيق الآخر)

ملف جديد مثلاً `/etc/nginx/sites-available/tenegta.com`:

```nginx
server {
    listen 80;
    server_name tenegta.com www.tenegta.com;
    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -sf /etc/nginx/sites-available/tenegta.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## تحقق أن النظام الآخر لم يُمس

```bash
# عمليات pm2 — يجب أن ترى tenegta منفصلاً
pm2 list

# قواعد PostgreSQL — tenegta_db منفصلة
sudo -u postgres psql -c "\l" | grep tenegta

# Node النظام (للتطبيق الآخر) لم يُستبدل إذا استخدمت nvm الجديد
/usr/bin/node -v
/var/www/tenegta/.nvm/versions/node/*/bin/node -v
```

---

## من جهازك (بدون SSH)

```powershell
npm run push:github
```

ثم على السيرفر: `git pull` + `bash scripts/server-update.sh`

---

## كلمات المرور

```bash
cat /var/www/tenegta/scripts/server-generated-credentials.txt
```
