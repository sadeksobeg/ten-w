"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

type KitV2 = {
  painPoints?: string[];
  scripts?: {
    direct?: string;
    consultative?: string;
    whatsapp?: string;
    call?: string;
  };
  objections?: { quote: string; response: string }[];
  audience?: string[];
  pain?: string[];
  solution?: string[];
  script?: string;
};

type StagePlan = {
  id: string;
  title: string;
  goal: string;
  framework: string;
  channels: string[];
  tactics: string[];
  deliverables: string[];
  kpis: string[];
};

type ProductPlaybook = {
  positioning: string;
  offerAngle: string;
  marketStudyQuestions: string[];
  stages: StagePlan[];
};

function asKit(v: unknown): KitV2 | null {
  if (typeof v !== "object" || v === null) return null;
  return v as KitV2;
}

const tabKeys = ["intro", "research", "stages", "talk", "objections", "execution"] as const;
type TabKey = (typeof tabKeys)[number];

type Props = {
  locale: string;
  productName: string;
  productSlug: string;
  priceCents: number;
  commissionBaseCents: number;
  marketingKit: unknown;
};

function getProductPlaybook(slug: string): ProductPlaybook {
  if (slug === "clinic-system") {
    return {
      positioning: "حل تشغيلي لرفع كفاءة استقبال المرضى وتقليل الهدر اليومي في العيادة.",
      offerAngle: "التركيز على الانضباط التشغيلي، وضوح رحلة المريض، وتقليل فقد المواعيد.",
      marketStudyQuestions: [
        "كم نسبة المواعيد الضائعة/المؤجلة شهريًا؟",
        "من المسؤول الفعلي عن القرار (المالك/مدير التشغيل/الطبيب)؟",
        "ما القنوات المستخدمة حاليًا للحجز والمتابعة؟",
        "ما متوسط زمن الرد على استفسارات المرضى؟",
      ],
      stages: [
        {
          id: "awareness",
          title: "مرحلة الوعي بالمشكلة",
          goal: "إقناع العيادة أن المشكلة تشغيلية وليست ضغط عمل طبيعي.",
          framework: "PAS (Problem-Agitate-Solution)",
          channels: ["واتساب", "مكالمة أولى قصيرة", "زيارات ميدانية عند الإمكان"],
          tactics: [
            "ابدأ بسؤال تشخيصي عن المواعيد المفقودة.",
            "اعرض خسارة الوقت/الإيراد الناتجة عن الفوضى.",
            "قدّم الحل كتنظيم مسار وليس كأداة فقط.",
          ],
          deliverables: ["رسالة افتتاح", "سيناريو مكالمة 5 دقائق", "حالة نجاح مشابهة"],
          kpis: ["معدل الرد الأولي", "نسبة حجز اجتماع تشخيصي", "عدد الفرص المؤهلة أسبوعيًا"],
        },
        {
          id: "discovery",
          title: "مرحلة التشخيص",
          goal: "جمع بيانات كافية لبناء عرض دقيق.",
          framework: "SPIN (Situation/Problem/Implication/Need-Payoff)",
          channels: ["اجتماع تشخيصي", "نموذج جمع بيانات"],
          tactics: [
            "حدد عنق الزجاجة: الاستقبال، الرد، المتابعة.",
            "اربط كل مشكلة بأثر مالي أو تشغيلي.",
            "اختتم التشخيص بخلاصة نقاط متفق عليها.",
          ],
          deliverables: ["ملخص تشخيص صفحة واحدة", "أولويات التحسين (Top 3)"],
          kpis: ["اكتمال بيانات التشخيص", "وضوح صاحب القرار", "نسبة القبول للمرحلة التالية"],
        },
        {
          id: "proposal",
          title: "مرحلة العرض والقيمة",
          goal: "تحويل التشخيص إلى عرض واضح بمراحل.",
          framework: "Value Proposition + AIDA",
          channels: ["عرض تقديمي", "مكالمة مراجعة العرض"],
          tactics: [
            "ابدأ بالنتيجة المتوقعة خلال 30-60 يوم.",
            "قسّم التنفيذ إلى مراحل قصيرة قابلة للقياس.",
            "قدّم السعر بعد تثبيت القيمة التشغيلية.",
          ],
          deliverables: ["عرض سعر", "خطة تنفيذ زمنية", "نطاق العمل"],
          kpis: ["نسبة قبول العرض", "مدة الدورة البيعية", "عدد الاعتراضات الحرجة"],
        },
        {
          id: "close",
          title: "مرحلة الإغلاق",
          goal: "تثبيت قرار التعاقد بخطوة تنفيذ فورية.",
          framework: "Risk Reversal + Clear CTA",
          channels: ["مكالمة قرار", "رسالة تأكيد نهائية"],
          tactics: [
            "عالج الاعتراض الأكبر أولًا (ثقة/وقت/سعر).",
            "ثبّت تاريخ بداية واضح ومسؤول تنفيذي.",
            "أغلق بسؤال قرار مباشر: نبدأ هذا الأسبوع أم القادم؟",
          ],
          deliverables: ["تأكيد التعاقد", "خطة الانطلاق", "نقطة اتصال رئيسية"],
          kpis: ["نسبة الإغلاق", "زمن الإغلاق بعد العرض", "نسبة التحويل من التشخيص للتعاقد"],
        },
      ],
    };
  }

  if (slug === "website") {
    return {
      positioning: "الموقع كقناة مبيعات/ثقة، وليس مجرد تصميم واجهة.",
      offerAngle: "تحسين التحويل والرسالة التجارية عبر هيكل صفحات فعّال.",
      marketStudyQuestions: [
        "ما هدف الموقع الأساسي: مبيعات، توليد عملاء، أم تعريف علامة؟",
        "ما الصفحات الأكثر زيارة والأقل تحويلًا؟",
        "من هو العميل المثالي وما رحلة اتخاذ القرار لديه؟",
        "ما نقاط ضعف المنافسين في تجربة مواقعهم؟",
      ],
      stages: [
        {
          id: "awareness",
          title: "وعي السوق والفرصة",
          goal: "إبراز أن الموقع الحالي لا يخدم الإيراد بشكل كاف.",
          framework: "JTBD + Funnel Thinking",
          channels: ["لينكدإن", "محتوى تعليمي", "رسائل موجهة"],
          tactics: [
            "أظهر فجوة التحويل بين الزيارة والإجراء.",
            "اربط تحسين الصفحة المقصودة بنتائج مباشرة.",
            "قدّم تحليلًا سريعًا مجانيًا لقابلية التحويل.",
          ],
          deliverables: ["تدقيق أولي للموقع", "نقاط تحسين سريعة"],
          kpis: ["عدد طلبات التدقيق", "نسبة فتح الرسائل", "نسبة الاجتماعات"],
        },
        {
          id: "discovery",
          title: "تشخيص التحويل",
          goal: "فهم رحلة الزائر ومعوقات الإجراء.",
          framework: "CRO Basics + User Journey",
          channels: ["ورشة قصيرة", "مراجعة رحلة المستخدم"],
          tactics: [
            "حدد نقاط التسرب في كل مرحلة من الرحلة.",
            "رتّب الصفحات حسب أثرها على التحويل.",
            "حوّل الفرضيات إلى خطة اختبار.",
          ],
          deliverables: ["خارطة رحلة", "خطة صفحات الأولوية"],
          kpis: ["وضوح فرضيات التحويل", "توافق الفريق على الأولويات"],
        },
        {
          id: "proposal",
          title: "العرض التنفيذي",
          goal: "تقديم نطاق واضح يوازن التصميم والأداء والتحويل.",
          framework: "AIDA + Conversion Architecture",
          channels: ["عرض تنفيذي", "مراجعة UX/UI"],
          tactics: [
            "ابدأ بالصفحات المؤثرة على الإيراد.",
            "اربط كل ميزة بمؤشر KPI.",
            "اعرض خطة إطلاق على دفعات.",
          ],
          deliverables: ["نطاق العمل", "خطة محتوى", "خطة إطلاق"],
          kpis: ["نسبة قبول العرض", "الوقت حتى القرار"],
        },
        {
          id: "close",
          title: "الإغلاق والبدء",
          goal: "توقيع العقد مع وضوح مسؤوليات ما بعد البيع.",
          framework: "Commitment Framing",
          channels: ["اجتماع توقيع", "وثيقة انطلاق"],
          tactics: [
            "اتفق على KPI أساسي أول 60 يوم.",
            "حدد مسؤول اعتماد المحتوى.",
            "ضع مواعيد تسليم دقيقة قبل البدء.",
          ],
          deliverables: ["خطة 30/60/90 يوم", "مؤشرات متابعة"],
          kpis: ["نسبة الالتزام بالخطة", "زمن الوصول لأول نتيجة"],
        },
      ],
    };
  }

  if (slug === "mobile-app") {
    return {
      positioning: "التطبيق كقناة احتفاظ وولاء تزيد LTV وتقلل churn.",
      offerAngle: "تركيز على رحلة المستخدم، التفاعل المتكرر، والقيمة المستمرة.",
      marketStudyQuestions: [
        "ما نسبة العودة الشهرية الحالية للمستخدمين؟",
        "ما أهم سبب فقد المستخدم بعد أول استخدام؟",
        "ما الوظائف التي تبرر تنزيل التطبيق بدل الموقع؟",
        "كيف تُقاس القيمة خلال أول 7 أيام؟",
      ],
      stages: [
        {
          id: "awareness",
          title: "بناء الحاجة للتطبيق",
          goal: "توضيح الفرق بين وجود تطبيق فعّال وبين مجرد قناة إضافية.",
          framework: "JTBD + Retention Economics",
          channels: ["عروض تنفيذية", "جلسات استراتيجية"],
          tactics: [
            "اربط التطبيق بتحسين الاحتفاظ والإيراد المتكرر.",
            "تجنب الحديث التقني المبكر، وابدأ بالأثر التجاري.",
            "قدم سيناريوهات استخدام حقيقية.",
          ],
          deliverables: ["فرضية قيمة التطبيق", "سيناريوهات الاستخدام"],
          kpis: ["نسبة التفاعل مع العرض", "نسبة الانتقال للتشخيص"],
        },
        {
          id: "discovery",
          title: "تشخيص المنتج والمستخدم",
          goal: "فهم سلوك المستخدم قبل بناء أي ميزة.",
          framework: "North Star Metric + User Journey",
          channels: ["ورشة اكتشاف", "مقابلات سريعة"],
          tactics: [
            "حدد North Star واحدة للتطبيق.",
            "افصل بين Must-have و Nice-to-have.",
            "حدد أحداث القياس منذ البداية.",
          ],
          deliverables: ["خريطة ميزات أولوية", "أحداث القياس"],
          kpis: ["وضوح الأولويات", "سرعة اعتماد النطاق"],
        },
        {
          id: "proposal",
          title: "عرض المراحل",
          goal: "تقليل المخاطرة عبر مراحل قابلة للإطلاق.",
          framework: "MVP + Iterative Delivery",
          channels: ["عرض تقني/تجاري", "خطة تنفيذ"],
          tactics: [
            "ابدأ بـ MVP يحقق النتيجة الأولى بسرعة.",
            "اربط كل مرحلة بمؤشر احتفاظ.",
            "وضّح مسار التوسع بعد الإطلاق.",
          ],
          deliverables: ["خطة MVP", "خطة إصدار", "خطة تحليل البيانات"],
          kpis: ["نسبة قبول نطاق MVP", "وقت القرار"],
        },
        {
          id: "close",
          title: "الإغلاق الذكي",
          goal: "توقيع العقد مع وضوح نجاح أول 90 يوم.",
          framework: "Outcome-Based Closing",
          channels: ["مكالمة قرار", "ملحق مؤشرات نجاح"],
          tactics: [
            "ثبت 3 مؤشرات نجاح بعد الإطلاق.",
            "اتفق على آلية تحسين شهرية.",
            "حدد مسؤوليات الأطراف بوضوح.",
          ],
          deliverables: ["وثيقة نجاح 90 يوم", "خطة تحسين مستمرة"],
          kpis: ["وضوح مؤشرات النجاح", "جاهزية الفريق للبدء"],
        },
      ],
    };
  }

  return {
    positioning: "الهوية البصرية كأداة ثقة وتموضع، لا كتصميم شكلي.",
    offerAngle: "تقوية الإدراك الذهني للعلامة ورفع الاتساق عبر كل نقاط التماس.",
    marketStudyQuestions: [
      "كيف يرى العميل العلامة حاليًا مقابل المنافس؟",
      "ما الرسالة التجارية التي يجب أن تترسخ بصريًا؟",
      "أين يظهر التشتت البصري في القنوات الحالية؟",
      "ما الشخصية التي نريد أن تعكسها الهوية؟",
    ],
    stages: [
      {
        id: "awareness",
        title: "تحديد فجوة الصورة الذهنية",
        goal: "إظهار أثر الهوية على الثقة والقرار الشرائي.",
        framework: "Brand Positioning Fundamentals",
        channels: ["جلسة تعريف", "أمثلة مقارنة"],
        tactics: [
          "اربط الهوية بمعدل الثقة والانطباع الأول.",
          "اعرض فروقات الإدراك بين العلامة والمنافس.",
          "حدد أثر الاتساق على المبيعات.",
        ],
        deliverables: ["تدقيق بصري", "خريطة تموضع"],
        kpis: ["وضوح الرسالة", "قبول إعادة التموضع"],
      },
      {
        id: "discovery",
        title: "اكتشاف العلامة",
        goal: "تحويل هوية العلامة إلى معايير قابلة للتنفيذ.",
        framework: "STP + Brand Archetype",
        channels: ["ورشة علامة", "مقابلات داخلية"],
        tactics: [
          "تعريف شريحة الجمهور الأساسية.",
          "اختيار نبرة العلامة وشخصيتها.",
          "تثبيت الوعد البصري للعلامة.",
        ],
        deliverables: ["موجز العلامة", "اتجاه بصري معتمد"],
        kpis: ["سرعة الاتفاق على الاتجاه", "ثبات الرسالة عبر الفريق"],
      },
      {
        id: "proposal",
        title: "عرض نظام الهوية",
        goal: "تقديم هوية قابلة للاستخدام اليومي.",
        framework: "Message-Market Fit",
        channels: ["عرض بصري", "نماذج تطبيق"],
        tactics: [
          "عرض تطبيق الهوية على سيناريوهات حقيقية.",
          "توضيح كيف تدعم الهوية البيع لا الشكل فقط.",
          "تسليم دليل استخدام عملي.",
        ],
        deliverables: ["شعار وأنظمة", "Brand Guidelines", "نماذج قنوات"],
        kpis: ["معدل اعتماد الهوية", "سرعة تطبيقها في القنوات"],
      },
      {
        id: "close",
        title: "الإغلاق والاعتماد",
        goal: "ضمان تطبيق الهوية بعد التسليم دون تشتت.",
        framework: "Activation Planning",
        channels: ["جلسة اعتماد", "خطة إطلاق"],
        tactics: [
          "تحديد ترتيب إطلاق القنوات.",
          "تدريب الفريق على قواعد الاستخدام.",
          "مراجعة أول شهر للتطبيق.",
        ],
        deliverables: ["خطة اعتماد 30 يوم", "قائمة ضبط الجودة البصرية"],
        kpis: ["نسبة الالتزام بالهوية", "جودة التطبيق في القنوات"],
      },
    ],
  };
}

export function ProductMarketingPlaybook({
  locale,
  productName,
  productSlug,
  priceCents,
  commissionBaseCents,
  marketingKit,
}: Props) {
  const nfLocale = locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const [tab, setTab] = useState<TabKey>("intro");
  const [stageIndex, setStageIndex] = useState(0);
  const [talkTone, setTalkTone] = useState<"direct" | "consultative" | "whatsapp" | "call">(
    "consultative",
  );
  const [clientState, setClientState] = useState<"cost" | "speed" | "trust">("trust");
  const [check, setCheck] = useState<Record<string, boolean>>({
    fit: false,
    pain: false,
    timeline: false,
    nextStep: false,
    followup: false,
  });

  const kit = asKit(marketingKit);
  const pains = useMemo(() => {
    if (!kit) return [];
    if (Array.isArray(kit.painPoints) && kit.painPoints.length) return kit.painPoints;
    return kit.pain ?? [];
  }, [kit]);
  const audience = kit?.audience ?? [];
  const solutions = kit?.solution ?? [];
  const playbook = useMemo(() => getProductPlaybook(productSlug), [productSlug]);
  const stages = playbook.stages;
  const activeStage = stages[Math.max(0, Math.min(stageIndex, stages.length - 1))]!;

  const baseScript =
    kit?.scripts?.[talkTone] ?? (talkTone === "direct" ? kit?.script : undefined) ?? "";
  const focusLine =
    clientState === "cost"
      ? "ركّز على العائد وسرعة استرداد التكلفة."
      : clientState === "speed"
        ? "ركّز على سرعة التنفيذ والزمن للوصول لأول نتيجة."
        : "ركّز على الثقة، الإثبات، والمخاطر الأقل.";
  const adaptedScript = `${baseScript}\n\nسطر التركيز: ${focusLine}`;
  const completion = Math.round(
    (Object.values(check).filter(Boolean).length / Object.values(check).length) * 100,
  );

  const checklistScore = Math.round(completion * 0.6);
  const stagesScore = Math.round(((stageIndex + 1) / Math.max(1, stages.length)) * 20);
  const scriptScore = baseScript.trim().length > 0 ? 10 : 0;
  const objectionsScore = (kit?.objections?.length ?? 0) > 0 ? 10 : 0;
  const readinessScore = Math.min(
    100,
    checklistScore + stagesScore + scriptScore + objectionsScore,
  );

  const readinessRecommendation =
    readinessScore >= 75
      ? "جاهز للعرض"
      : readinessScore >= 45
        ? "يحتاج بحث إضافي"
        : "لا تتابع الآن";

  const recommendationTone =
    readinessScore >= 75
      ? "border-emerald-400/35 bg-emerald-500/12 text-emerald-100"
      : readinessScore >= 45
        ? "border-amber-400/35 bg-amber-500/12 text-amber-100"
        : "border-rose-400/35 bg-rose-500/12 text-rose-100";

  const readinessGaps: string[] = [];
  if (completion < 80) readinessGaps.push("أكمِل قائمة التنفيذ بنسبة أعلى (80%+).");
  if (stageIndex < stages.length - 1) readinessGaps.push("مرّ على جميع مراحل المشروع حتى مرحلة الإغلاق.");
  if (scriptScore === 0) readinessGaps.push("جهّز سكربت تواصل مناسب قبل العرض.");
  if (objectionsScore === 0) readinessGaps.push("أضف اعتراضات وردود جاهزة قبل المتابعة.");

  return (
    <div dir="rtl" className="space-y-5">
      <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/10 to-black/40 p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-gold/80">
          دليل تسويق تنفيذي
        </div>
        <h1 className="mt-2 font-[family-name:var(--font-cairo)] text-2xl font-black text-white">
          {productName}
        </h1>
        <p className="mt-2 text-sm text-white/70">
          صفحة تفصيلية بالمراحل، الأنيمشن، وأفضل الطرق التسويقية وفق أساسيات عالمية: STP،
          Value Proposition، AIDA، PAS، وقياس الأداء.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-black/25 p-4">
          <div className="text-xs text-white/45">قيمة العقد</div>
          <div className="mt-2 text-lg font-black text-white">
            {new Intl.NumberFormat(nfLocale, {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(priceCents / 100)}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-4">
          <div className="text-xs text-white/45">العمولة الأساسية</div>
          <div className="mt-2 text-lg font-black text-gold">
            {new Intl.NumberFormat(nfLocale, {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(commissionBaseCents / 100)}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-4">
          <div className="text-xs text-white/45">التموضع</div>
          <div className="mt-2 text-sm font-semibold text-white/85">{playbook.positioning}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-4">
          <div className="text-xs text-white/45">زاوية العرض</div>
          <div className="mt-2 text-sm font-semibold text-white/85">{playbook.offerAngle}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabKeys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              tab === k
                ? "bg-gold/25 text-gold"
                : "border border-white/10 bg-white/[0.04] text-white/70 hover:border-gold/25"
            }`}
          >
            {k === "intro"
              ? "من الصفر"
              : k === "research"
                ? "بحث قبل العقد"
                : k === "stages"
                  ? "مراحل المشروع"
                  : k === "talk"
                    ? "كيف تتحدث"
                    : k === "objections"
                      ? "الاعتراضات"
                      : "التنفيذ"}
          </button>
        ))}
      </div>

      {tab === "intro" ? (
        <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm font-bold text-white">شرح النظام من الصفر للمسوّق</div>
          <ol className="list-decimal space-y-2 pe-5 text-sm leading-relaxed text-white/80">
            <li>افهم المنتج كحل لنتيجة تجارية، وليس مجرد ميزات تقنية.</li>
            <li>حدد الشريحة المناسبة (STP) قبل أي تواصل عشوائي.</li>
            <li>شخّص الألم الحقيقي بأرقام تقريبية (وقت/مال/فقد فرص).</li>
            <li>اعرض القيمة قبل السعر، ثم أغلق بخطوة واحدة واضحة وتاريخ.</li>
            <li>تابع الأداء بالمؤشرات (تحويل، مدة دورة البيع، نسبة الإغلاق).</li>
          </ol>
          <div className="rounded-lg border border-gold/25 bg-gold/10 px-3 py-2 text-xs text-gold/95">
            القاعدة العالمية: One dominant outcome + one clear CTA + one owner.
          </div>
        </div>
      ) : null}

      {tab === "research" ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-bold text-white">بحث قبل العقد (Mandatory)</div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {playbook.marketStudyQuestions.map((q, idx) => (
                <div key={q} className="rounded-lg border border-white/10 bg-black/25 p-3">
                  <div className="text-xs font-semibold text-gold/90">سؤال {idx + 1}</div>
                  <div className="mt-1 text-sm text-white/80">{q}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-semibold text-white/55">مخرجات البحث المطلوبة قبل العرض</div>
            <ul className="mt-3 list-disc space-y-2 pe-5 text-sm text-white/80">
              <li>تعريف واضح لصاحب القرار (Decision Owner).</li>
              <li>3 مشكلات رئيسية مرتبة حسب تأثيرها على العمل.</li>
              <li>فرضية قيمة واحدة يمكن قياسها خلال 30-60 يوم.</li>
              <li>سبب إقناع واضح: لماذا الآن؟ ولماذا هذا المنتج؟</li>
            </ul>
          </div>
        </div>
      ) : null}

      {tab === "stages" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {stages.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStageIndex(idx)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  idx === stageIndex
                    ? "border-gold/50 bg-gold/20 text-gold"
                    : "border-white/10 bg-white/[0.04] text-white/65 hover:border-white/25"
                }`}
              >
                المرحلة {idx + 1}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold text-gold/80">مسار المشروع</div>
                  <div className="mt-1 text-lg font-black text-white">{activeStage.title}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] text-white/70">
                  {stageIndex + 1} / {stages.length}
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold-bright"
                  initial={{ width: 0 }}
                  animate={{ width: `${((stageIndex + 1) / stages.length) * 100}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                  <div className="text-xs font-semibold text-white/50">الهدف</div>
                  <div className="mt-1 text-sm text-white/85">{activeStage.goal}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                  <div className="text-xs font-semibold text-white/50">الأساس التسويقي</div>
                  <div className="mt-1 text-sm text-gold/90">{activeStage.framework}</div>
                </div>
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                  <div className="text-xs font-semibold text-white/50">القنوات</div>
                  <ul className="mt-2 list-disc space-y-1 pe-4 text-sm text-white/80">
                    {activeStage.channels.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                  <div className="text-xs font-semibold text-white/50">التكتيكات</div>
                  <ul className="mt-2 list-disc space-y-1 pe-4 text-sm text-white/80">
                    {activeStage.tactics.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                  <div className="text-xs font-semibold text-white/50">مخرجات المرحلة</div>
                  <ul className="mt-2 list-disc space-y-1 pe-4 text-sm text-white/80">
                    {activeStage.deliverables.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                  <div className="text-xs font-semibold text-white/50">مؤشرات القياس (KPI)</div>
                  <ul className="mt-2 list-disc space-y-1 pe-4 text-sm text-white/80">
                    {activeStage.kpis.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  disabled={stageIndex === 0}
                  onClick={() => setStageIndex((i) => Math.max(0, i - 1))}
                  className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/75 disabled:opacity-35"
                >
                  المرحلة السابقة
                </button>
                <button
                  type="button"
                  disabled={stageIndex >= stages.length - 1}
                  onClick={() => setStageIndex((i) => Math.min(stages.length - 1, i + 1))}
                  className="rounded-lg border border-gold/35 bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold disabled:opacity-35"
                >
                  المرحلة التالية
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : null}

      {tab === "talk" ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="rounded-xl border border-white/10 bg-black/25 p-4">
              <div className="text-xs text-white/50">نمط المحادثة</div>
              <select
                value={talkTone}
                onChange={(e) => setTalkTone(e.target.value as typeof talkTone)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-gold/35"
              >
                <option value="direct">عرض مباشر</option>
                <option value="consultative">استشاري</option>
                <option value="whatsapp">افتتاح واتساب</option>
                <option value="call">افتتاح مكالمة</option>
              </select>
            </label>
            <label className="rounded-xl border border-white/10 bg-black/25 p-4">
              <div className="text-xs text-white/50">قلق العميل</div>
              <select
                value={clientState}
                onChange={(e) => setClientState(e.target.value as typeof clientState)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-gold/35"
              >
                <option value="trust">يحتاج ثقة وإثبات</option>
                <option value="cost">حساس للسعر</option>
                <option value="speed">يريد سرعة</option>
              </select>
            </label>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 p-4">
            <div className="text-xs font-semibold text-white/50">النص التفاعلي المقترح</div>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/35 p-4 text-xs leading-relaxed text-white/85">
              {adaptedScript || "لا يوجد سكربت جاهز لهذا النمط حاليًا."}
            </pre>
          </div>
        </div>
      ) : null}

      {tab === "objections" ? (
        <div className="space-y-3">
          {(kit?.objections ?? []).length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm text-white/60">
              لا توجد ردود جاهزة على الاعتراضات بعد.
            </p>
          ) : (
            (kit?.objections ?? []).map((o, i) => (
              <details key={i} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-gold/90">
                  {o.quote}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{o.response}</p>
              </details>
            ))
          )}
        </div>
      ) : null}

      {tab === "execution" ? (
        <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="rounded-xl border border-gold/30 bg-gold/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white/60">تقييم جاهزية العقد</div>
                <div className="mt-1 text-3xl font-black text-white">{readinessScore}/100</div>
              </div>
              <div className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${recommendationTone}`}>
                {readinessRecommendation}
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold-bright"
                initial={{ width: 0 }}
                animate={{ width: `${readinessScore}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="mt-3 grid gap-2 text-[11px] text-white/75 sm:grid-cols-2">
              <div>قائمة التنفيذ: {checklistScore}/60</div>
              <div>تقدم المراحل: {stagesScore}/20</div>
              <div>جاهزية السكربت: {scriptScore}/10</div>
              <div>جاهزية الاعتراضات: {objectionsScore}/10</div>
            </div>
            {readinessGaps.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 pe-5 text-xs text-white/75">
                {readinessGaps.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 text-xs text-emerald-200/90">
                الجاهزية مكتملة تقريبًا. انتقل مباشرة إلى عرض رسمي بخطوة تالية مؤرخة.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">خطة تنفيذ المسوّق</div>
            <div className="text-xs font-semibold text-gold">{completion}%</div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold-bright transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          <div className="space-y-2">
            {(
              [
                ["fit", "تحقق من ملاءمة ICP وصاحب القرار"],
                ["pain", "وثّق 2-3 نقاط ألم مربوطة بأثر تجاري"],
                ["timeline", "اتفق على إطار زمني أولي للتنفيذ"],
                ["nextStep", "ثبت خطوة تالية واحدة مع تاريخ واضح"],
                ["followup", "أرسل متابعة مكتوبة خلال 24 ساعة"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/80"
              >
                <input
                  type="checkbox"
                  checked={check[key]}
                  onChange={(e) => setCheck((prev) => ({ ...prev, [key]: e.target.checked }))}
                  className="h-4 w-4 accent-[rgb(201,160,97)]"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
            مبدأ التنفيذ العالمي: لا تنتقل للمرحلة التالية قبل إغلاق مخرجات المرحلة الحالية.
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="text-xs font-semibold text-white/50">الفئة المستهدفة</div>
              <ul className="mt-2 list-disc space-y-1 pe-4 text-xs text-white/75">
                {audience.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="text-xs font-semibold text-white/50">نقاط الألم</div>
              <ul className="mt-2 list-disc space-y-1 pe-4 text-xs text-white/75">
                {pains.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="text-xs font-semibold text-white/50">الحل</div>
              <ul className="mt-2 list-disc space-y-1 pe-4 text-xs text-white/75">
                {solutions.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
