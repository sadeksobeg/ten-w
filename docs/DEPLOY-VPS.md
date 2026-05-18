# نشر T.E.N.E.G.T.A على VPS (tenegta.com)

المستودع: [github.com/sadeksobeg/ten-w](https://github.com/sadeksobeg/ten-w)

## 1. استنساخ الكود (تم)

```bash
mkdir -p /var/www/tenegta
cd /var/www/tenegta
git clone https://github.com/sadeksobeg/ten-w.git .
```

## 2. ملف البيئة

```bash
# احصل على AUTH_SECRET قبل فتح المحرر
openssl rand -base64 32

cd /var/www/tenegta/site
cp .env.vps.example .env
nano .env
```

عدّل في `.env`:

| المتغير | القيمة |
|---------|--------|
| `DATABASE_URL` | `postgresql://tenegta_user:Tenegta2025Secure@127.0.0.1:5432/tenegta_db` |
| `AUTH_SECRET` | ناتج أمر `openssl rand -base64 32` (لا تتركه `PASTE_...`) |
| `AUTH_URL` | `https://tenegta.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://tenegta.com` |
| `NODE_ENV` | `production` |
| `PORT` | `3100` |
| `FORMSPREE_ENDPOINT` | رابط Formspree الحقيقي (مطلوب للنشر) |

احفظ: `Ctrl+X` → `Y` → `Enter`.

> **أمان:** لا ترفع ملف `.env` إلى Git. إذا كان المستودع عاماً، غيّر كلمة مرور PostgreSQL بعد أول نشر.

## 3. PostgreSQL (إن لم يكن جاهزاً)

```bash
sudo -u postgres psql <<'SQL'
CREATE USER tenegta_user WITH PASSWORD 'Tenegta2025Secure';
CREATE DATABASE tenegta_db OWNER tenegta_user;
GRANT ALL PRIVILEGES ON DATABASE tenegta_db TO tenegta_user;
SQL
```

## 4. تثبيت الاعتماديات والبناء

```bash
cd /var/www/tenegta
# Node 20+ مطلوب
node -v

npm ci
cd site
npm run check:env
npx prisma migrate deploy
npm run db:seed
cd ..
npm run build --workspace=tenegta-website
```

أو من جذر المستودع:

```bash
cd /var/www/tenegta/site
npm ci
npm run check:env
npx prisma migrate deploy
npm run db:seed
npm run build
```

## 5. تشغيل التطبيق (PM2)

```bash
cd /var/www/tenegta/site
npm install -g pm2
pm2 start npm --name tenegta -- start
pm2 save
pm2 startup
```

التطبيق يستمع على `http://127.0.0.1:3100`.

## 6. Nginx (مثال)

```nginx
server {
    listen 80;
    server_name tenegta.com www.tenegta.com;
    return 301 https://tenegta.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tenegta.com www.tenegta.com;

    # ssl_certificate /etc/letsencrypt/live/tenegta.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/tenegta.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

شهادة SSL: `sudo certbot --nginx -d tenegta.com -d www.tenegta.com`

## 7. تحديث لاحق من Git

```bash
cd /var/www/tenegta
git pull origin main
cd site
npm ci
npx prisma migrate deploy
npm run build
pm2 restart tenegta
```

## 8. تحقق سريع

```bash
curl -I http://127.0.0.1:3100
curl -I https://tenegta.com
```
