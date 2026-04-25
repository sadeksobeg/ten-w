import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

const ARABIC_KITS: Record<string, Record<string, unknown>> = {
  "clinic-system": {
    version: 2,
    icp: {
      label: "عيادات خاصة تبحث عن تنظيم المواعيد وتحسين تجربة المريض",
      businessType: "الرعاية الصحية",
      teamSize: "5 إلى 80 موظف",
      ageRange: "أعمار صانع القرار 30–55",
    },
    painPoints: [
      "تأخير في المتابعة أو عدم وضوح المسار للعميل",
      "فوضى في التواصل بين القنوات",
      "ضياع فرص بسبب غياب عملية متابعة ثابتة",
    ],
    audience: ["العيادات الخاصة والأطباء المستقلون"],
    pain: ["ضعف التنظيم", "هدر الوقت في التنسيق", "متابعات غير متسقة"],
    solution: ["أتمتة التواصل والردود الأولية", "مسار عمل منظم مع تذكيرات", "لوحة تشغيل ومؤشرات متابعة"],
    scripts: {
      direct: "هل تعانون من ضغط المواعيد؟ نقدر ننظم دخول الحالات عبر مسار واضح وسريع ونقلل الفوضى اليومية.",
      consultative: "ما الذي سيتغير في التشغيل لو أصبح كل عميل يسير في مسار واضح من أول تواصل حتى الإغلاق؟",
      whatsapp:
        "أهلاً {name}، نساعدكم في تحويل التواصل اليومي لمسار منظم يرفع الكفاءة ويقلل الضياع. مناسب أرسل مثال سريع؟",
      call: "ابدأ بالنتيجة المطلوبة، اسأل عن نقطة التعطّل الحالية، ثم اقترح خطوة تالية واضحة بتاريخ.",
    },
    objections: [
      {
        quote: "لدينا نظام بالفعل.",
        response: "ممتاز، نحن لا نهدم الموجود بل نغلق الفجوة بين النظام والتواصل الفعلي مع العميل.",
      },
      {
        quote: "ليس هذا الربع.",
        response: "مفهوم. نقدر نبدأ بخطوة صغيرة تثبت الأثر، ثم تتوسعوا بثقة في الربع القادم.",
      },
    ],
    script:
      "نرتب رحلة المريض من أول رسالة حتى الموعد النهائي بطريقة واضحة تقلل الضغط على فريق الاستقبال.",
  },
  "visual-identity": {
    version: 2,
    icp: {
      label: "مشاريع تحتاج صورة احترافية واضحة في السوق",
      businessType: "شركات ناشئة ومتوسطة",
      teamSize: "2 إلى 40 موظف",
      ageRange: "25–50",
    },
    painPoints: ["هوية غير متسقة", "ضعف الثقة البصرية", "صعوبة التمييز عن المنافسين"],
    audience: ["شركات جديدة", "مشاريع إعادة تموضع"],
    pain: ["تشويش بصري", "رسالة غير واضحة", "ضعف الانطباع الأول"],
    solution: ["نظام هوية متكامل", "دليل استخدام واضح", "توحيد بصري عبر القنوات"],
    scripts: {
      direct: "الهوية البصرية ليست شكلًا فقط، بل أداة ثقة وبيع. نعيد صياغة صورتكم لتخدم النمو.",
      consultative: "كيف يؤثر الانطباع البصري الحالي على قرار الشراء عند العميل؟",
      whatsapp: "مرحبًا {name}، عندنا إطار واضح لتطوير هوية ترفع الثقة والانطباع خلال وقت قصير.",
      call: "ابدأ بسؤال عن صورة العلامة الحالية، ثم اربطها بهدف تجاري مباشر.",
    },
    objections: [
      { quote: "يمكن تصميم شعار فقط.", response: "الشعار جزء بسيط، القوة في نظام متكامل يثبت حضور العلامة." },
    ],
    script: "نصمم هوية بصرية تخدم المبيعات والتموضع، وليس مجرد شكل جميل.",
  },
  website: {
    version: 2,
    icp: {
      label: "جهات تريد موقعًا يحقق هدفًا تجاريًا واضحًا",
      businessType: "أعمال خدمية وتجارية",
      teamSize: "5 إلى 120 موظف",
      ageRange: "28–55",
    },
    painPoints: ["موقع لا يحول الزوار", "بطء وتجربة ضعيفة", "صعوبة إدارة المحتوى"],
    audience: ["شركات تريد نمو المبيعات", "جهات تحتاج حضورًا احترافيًا"],
    pain: ["تحويل منخفض", "رسالة غير واضحة", "ضعف الثقة"],
    solution: ["صفحات موجهة للتحويل", "أداء وسرعة", "هيكل محتوى قابل للتوسع"],
    scripts: {
      direct: "الموقع يجب أن يبيع ويقود قرار العميل، لا أن يكون مجرد واجهة.",
      consultative: "كم فرصة تضيع حاليًا بسبب تجربة الموقع الحالية؟",
      whatsapp: "أهلًا {name}، نطور مواقع تركز على التحويل والنتيجة وليس الشكل فقط.",
      call: "اسأل عن هدف الموقع، ثم اربط كل صفحة بمؤشر أداء.",
    },
    objections: [
      { quote: "لدينا موقع بالفعل.", response: "السؤال ليس هل يوجد موقع، بل هل يحقق النتيجة المطلوبة فعليًا؟" },
    ],
    script: "نحوّل الموقع إلى قناة مبيعات وموثوقية تعمل يوميًا لصالح العمل.",
  },
  "mobile-app": {
    version: 2,
    icp: {
      label: "شركات تحتاج قناة تطبيق لرفع الولاء والتكرار",
      businessType: "خدمات ومنتجات رقمية",
      teamSize: "10 إلى 200 موظف",
      ageRange: "30–55",
    },
    painPoints: ["فقد المستخدمين", "ضعف التجربة على الجوال", "غياب قناة مباشرة مع العميل"],
    audience: ["شركات نمو", "منصات خدمات"],
    pain: ["احتفاظ منخفض", "تجربة غير مستقرة", "تواصل ضعيف"],
    solution: ["تطبيق متوازن الأداء", "رحلات مستخدم واضحة", "إشعارات وولاء ذكي"],
    scripts: {
      direct: "تطبيق الموبايل يضاعف القرب من العميل ويزيد الاحتفاظ عندما يُبنى على رحلة واضحة.",
      consultative: "ما نسبة المستخدمين الذين يعودون لكم خلال 30 يوم؟",
      whatsapp: "نقدر نبني تطبيق يخدم الاحتفاظ والولاء بدل مجرد نسخة من الموقع.",
      call: "ابدأ بهدف الاحتفاظ/الإيراد ثم اربطه بمزايا التطبيق الأساسية.",
    },
    objections: [
      { quote: "المشروع كبير.", response: "نقسمه لمراحل واضحة ونقيس النتيجة في كل مرحلة قبل التوسع." },
    ],
    script: "تطبيق عملي يربط العميل بالعلامة بشكل مستمر ويخلق قيمة متكررة.",
  },
};

async function main() {
  await prisma.product.update({
    where: { slug: "clinic-system" },
    data: {
      name: "عقد العيادات",
      priceCents: 120_00,
      commissionBaseCents: 40_00,
      marketingKit: ARABIC_KITS["clinic-system"] as Prisma.InputJsonValue,
    },
  });
  await prisma.product.update({
    where: { slug: "website" },
    data: {
      name: "الموقع",
      priceCents: 4500_00,
      commissionBaseCents: 500_00,
      marketingKit: ARABIC_KITS.website as Prisma.InputJsonValue,
    },
  });
  await prisma.product.update({
    where: { slug: "mobile-app" },
    data: {
      name: "تطبيق الموبايل",
      priceCents: 9500_00,
      commissionBaseCents: 1000_00,
      marketingKit: ARABIC_KITS["mobile-app"] as Prisma.InputJsonValue,
    },
  });
  await prisma.product.update({
    where: { slug: "visual-identity" },
    data: {
      name: "هوية بصرية",
      priceCents: 300_00,
      commissionBaseCents: 100_00,
      marketingKit: ARABIC_KITS["visual-identity"] as Prisma.InputJsonValue,
    },
  });
  // eslint-disable-next-line no-console
  console.log("Growth products updated to Arabic pricing + kits.");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
