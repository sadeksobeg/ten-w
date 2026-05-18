# عناوين المقالات الخمسة + frontmatter جاهز للنسخ

## المقال 1 — مكتمل أعلاه ✅
- EN: `why-enterprise-ai-fails.en.mdx`
- AR: `why-enterprise-ai-fails.ar.mdx`

---

## المقال 2 — الدين الأمني
**EN slug:** `security-debt-hidden-cost`

```mdx
---
title: "The Hidden Cost of Security Debt in Fast-Growing Tech Companies"
titleAr: "التكلفة الخفية للدين الأمني في شركات التقنية سريعة النمو"
excerpt: "Every feature shipped without security review is a future incident waiting for the right attacker. The cost isn't theoretical — it compounds."
date: "2024-10-05"
tags: ["Cybersecurity", "Security Debt", "Zero-Trust", "Engineering"]
pillar: "cyber"
readingTime: 7
relatedCaseStudy: "zero-trust-soc"
---
```

**المقاطع الرئيسية للمقال:**
- What security debt actually is (vs technical debt)
- The 4 invisible accumulation points: authentication shortcuts, missing input validation, hardcoded secrets, unmonitored dependencies
- Real cost model: breach cost vs prevention cost (cite IBM Cost of Data Breach averages)
- The "security sprint" fallacy — why you can't fix debt in one sprint
- Framework: Security as a first-class architectural decision
- CTA → zero-trust-soc case study

---

## المقال 3 — SaaS متعدد المستأجرين
**EN slug:** `multi-tenant-saas-lessons`

```mdx
---
title: "Building Multi-Tenant SaaS at Scale: Lessons from 12 Deployments"
titleAr: "بناء SaaS متعدد المستأجرين على نطاق واسع: دروس من 12 نشراً"
excerpt: "The architecture decisions that feel like details in a 3-client pilot become load-bearing walls at 40 clients. Here's what we've learned about the ones that matter most."
date: "2024-09-01"
tags: ["SaaS", "Multi-Tenancy", "Architecture", "PostgreSQL", "Scale"]
pillar: "software"
readingTime: 11
relatedCaseStudy: "multi-tenant-saas-scale"
---
```

**المقاطع الرئيسية:**
- The three isolation models: shared schema, schema-per-tenant, database-per-tenant — tradeoffs table
- Row-Level Security deep dive with PostgreSQL code example
- The onboarding automation problem (why < 10 min matters)
- Observability in multi-tenant: attributing latency to the right tenant
- Feature flags for per-tenant capabilities
- The upgrade problem: how to roll out schema changes without downtime
- CTA → multi-tenant-saas-scale case study

---

## المقال 4 — من Pilot إلى Prod
**EN slug:** `ai-pilot-to-production-latency`

```mdx
---
title: "From Pilot to Production: How We Reduced AI Model Latency by 60%"
titleAr: "من التجربة إلى الإنتاج: كيف خفّضنا زمن استجابة نموذج الذكاء الاصطناعي بنسبة 60٪"
excerpt: "A model's accuracy in a notebook is the least interesting thing about it. What matters is how fast it can make a decision when a real user is waiting."
date: "2024-08-15"
tags: ["MLOps", "Latency", "Production", "Optimization", "AI"]
pillar: "ai"
readingTime: 8
relatedCaseStudy: "enterprise-ai-ops"
---
```

**المقاطع الرئيسية:**
- Baseline: what the model looked like before (PyTorch → ONNX pipeline, p95 latency 420ms)
- The 5 optimization levers: model quantization, inference batching, feature caching, async preprocessing, horizontal scaling
- ONNX Runtime + quantization code example
- The monitoring setup that made it reproducible
- Before/after: 420ms → 168ms p95 (−60%)
- Why premature optimization kills projects (optimize the right bottleneck)
- CTA → contact + enterprise-ai-ops case study

---

## المقال 5 — Zero-Trust فلسفة
**EN slug:** `zero-trust-philosophy`

```mdx
---
title: "Zero-Trust Architecture Is Not a Product — It's a Design Philosophy"
titleAr: "معمارية Zero-Trust ليست منتجاً — إنها فلسفة تصميم"
excerpt: "Every vendor will sell you a Zero-Trust solution. Most of them are selling you a perimeter by another name. Here's what Zero-Trust actually means in practice."
date: "2024-07-20"
tags: ["Zero-Trust", "Cybersecurity", "Architecture", "NIST", "Philosophy"]
pillar: "cyber"
readingTime: 8
relatedCaseStudy: "zero-trust-soc"
---
```

**المقاطع الرئيسية:**
- The origin of Zero-Trust (John Kindervag, 2010) — and why it took 10 years to matter
- What it's NOT: it's not a product, not a network topology change, not a VPN replacement
- The three principles: verify explicitly, use least privilege, assume breach
- The five implementation layers: Identity, Device, Network, Application, Data
- Common implementation mistakes: starting with network instead of identity; buying a product before defining the threat model
- The phased rollout approach (why Big Bang fails)
- How to evaluate if a vendor is selling real Zero-Trust or rebranded perimeter security (checklist)
- CTA → zero-trust-soc case study + contact

---

## ترتيب النشر الموصى به

| # | Slug | التاريخ | الهدف |
|---|------|---------|-------|
| 1 | `why-enterprise-ai-fails` | Nov 2024 | CTO/CDO — awareness |
| 2 | `security-debt-hidden-cost` | Oct 2024 | CISO — pain point |
| 3 | `multi-tenant-saas-lessons` | Sep 2024 | CTO/Architect — technical depth |
| 4 | `ai-pilot-to-production-latency` | Aug 2024 | AI/ML Engineers — practical |
| 5 | `zero-trust-philosophy` | Jul 2024 | CISO/Security team — philosophy |

## ملاحظات للتنفيذ في Cursor

1. ضع الملفات في `site/content/blog/`
2. كل مقال: ملف EN + ملف AR (فرنسية يمكن إضافتها لاحقاً)
3. المقال 1 مكتمل بالكامل — المقالات 2-5 تحتاج توسيع المقاطع أعلاه
4. استخدم البرومبت: "Write a full 2000-word technical blog post in [EN/AR] based on this outline: [الصق المقاطع]. Style: problem-first, specific examples, code where relevant, CTA at the end. Audience: enterprise CTO/CISO."
