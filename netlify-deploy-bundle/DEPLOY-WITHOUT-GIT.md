# نشر المشروع على Netlify بدون GitHub

(نسخة مرجعية — راجع **`DEPLOY-WITHOUT-GIT.md`** في جذر المشروع للنص الكامل.)

**سحب وإفلات المجلد/ZIP في Netlify:** يستضيف **ملفات ثابتة فقط** (HTML/CSS/JS)، وليس مشروع Next.js المصدري ولا `.next` وحدها. هذا المشروع يحتاج **`netlify deploy --prod`** بعد `npm run build` (أو `npm run deploy:netlify`).
