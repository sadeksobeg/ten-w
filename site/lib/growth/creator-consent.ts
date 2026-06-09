export const CREATOR_CONSENT_VERSION = "v1.0-2026-06";

/**
 * Legal evidence design (GDPR Art. 7, eIDAS-friendly click-wrap, ESIGN):
 * - Immutable CreatorConsentLedger (append-only)
 * - Full agreement snapshot in the language read
 * - SHA-256 document hash + version
 * - Signer identity snapshot, IP, user agent, UTC timestamp
 * - Checkbox attestations + qualification statement
 * - Re-consent chains via previousRecordId
 */

export const CONSENT_CHANGELOG: Record<string, string> = {
  "v1.0-2026-06": "النص الأصلي للاتفاقية / Original agreement text",
};

export const CREATOR_CONSENT_TEXT = {
  ar: `
أنا، الموقّع أدناه، أوافق على الشروط والأحكام التالية المتعلقة بمشاركتي في برنامج شركاء المحتوى لدى T.E.N.E.G.T.A:

**أولاً — طبيعة العلاقة التسويقية**
١. أوافق على إنشاء ونشر محتوى تسويقي يتعلق بخدمات ومنتجات شركة T.E.N.E.G.T.A على قنواتي ومنصاتي الشخصية.
٢. أفهم وأوافق على أن محتوى التسويق يُنشر باسمي وعلى مسؤوليتي الكاملة.
٣. ألتزم بالإفصاح الواضح والصريح لجمهوري عن طبيعة العلاقة التجارية مع T.E.N.E.G.T.A وعن أي تعويض أو عمولة أحصل عليها وفق القوانين المعمول بها.

**ثانياً — المسؤولية عن المحتوى**
٤. أتحمل المسؤولية الكاملة عن أي محتوى أنشره أو أشاركه يتعلق بـ T.E.N.E.G.T.A.
٥. أوافق على عدم تقديم وعود أو ضمانات لم تُصرّح بها الشركة رسمياً.
٦. ألتزم بعدم نشر أي محتوى مضلل أو كاذب أو مخالف للأنظمة والقوانين المعمول بها.
٧. أوافق على أن T.E.N.E.G.T.A غير مسؤولة عن أي مطالبات قانونية تنشأ عن محتوى أنشرته بشكل مستقل.

**ثالثاً — التأهيل والكفاءة**
٨. أُقرّ بأنني أملك الأهلية القانونية الكاملة لإبرام هذه الاتفاقية.
٩. أُقرّ بأنني ملتزم بجميع القوانين واللوائح المنظِّمة للإعلان التجاري وصناعة المحتوى في بلد إقامتي.
١٠. أُقرّ بأن معلوماتي ومنصاتي حقيقية ولا تنتهك حقوق الغير.

**رابعاً — العمولات والمدفوعات**
١١. أفهم أن العمولات تُصرف وفق سياسة الشركة المعتمدة وبعد التحقق من صحة الإحالات.
١٢. أوافق على أن الشركة تحتفظ بحق مراجعة وتعديل برنامج العمولات مع إشعار مسبق.

**خامساً — إنهاء المشاركة**
١٣. أفهم أن الشركة تحتفظ بحق إنهاء مشاركتي في البرنامج في حال مخالفة هذه الشروط.

بالنقر على «أوافق وأتحمل المسؤولية كاملاً» أعلاه، أُقرّ بأنني قرأت وفهمت ووافقت على جميع الشروط المذكورة أعلاه.
  `.trim(),

  en: `
I, the undersigned, agree to the following terms and conditions regarding my participation in T.E.N.E.G.T.A's Creator Partner Program:

**1. Marketing Relationship**
1. I agree to create and publish marketing content related to T.E.N.E.G.T.A's services on my personal channels and platforms.
2. I understand that marketing content is published under my name and at my full responsibility.
3. I commit to clearly disclosing to my audience the commercial relationship with T.E.N.E.G.T.A and any compensation or commission I receive, in compliance with applicable laws.

**2. Content Responsibility**
4. I bear full responsibility for any content I publish or share related to T.E.N.E.G.T.A.
5. I agree not to make promises or guarantees not officially stated by the company.
6. I commit to not publishing misleading, false, or legally non-compliant content.
7. I agree that T.E.N.E.G.T.A is not responsible for any legal claims arising from content I independently publish.

**3. Qualification**
8. I declare that I have full legal capacity to enter into this agreement.
9. I declare that I comply with all laws and regulations governing commercial advertising in my country.
10. I declare that my information and platforms are genuine and do not infringe on others' rights.

**4. Commissions**
11. I understand commissions are paid per company policy after referral verification.
12. I agree the company may revise the commission program with prior notice.

**5. Termination**
13. I understand the company reserves the right to terminate my participation for violations.

By clicking "I Agree and Accept Full Responsibility," I confirm I have read, understood, and agreed to all terms above.
  `.trim(),

  fr: `
Je soussigné(e) accepte les conditions suivantes concernant ma participation au programme créateurs partenaires de T.E.N.E.G.T.A :

**1. Relation marketing**
1. J'accepte de créer et publier du contenu marketing relatif aux services de T.E.N.E.G.T.A sur mes canaux personnels.
2. Je comprends que ce contenu est publié sous mon nom et sous ma responsabilité exclusive.
3. Je m'engage à divulguer clairement à mon audience la relation commerciale avec T.E.N.E.G.T.A et toute rémunération reçue, conformément aux lois applicables.

**2. Responsabilité du contenu**
4. J'assume l'entière responsabilité de tout contenu publié ou partagé concernant T.E.N.E.G.T.A.
5. Je m'engage à ne pas faire de promesses non officiellement validées par l'entreprise.
6. Je m'engage à ne pas publier de contenu trompeur, faux ou non conforme.
7. J'accepte que T.E.N.E.G.T.A ne soit pas responsable des réclamations légales liées à mon contenu indépendant.

**3. Qualification**
8. Je déclare avoir la pleine capacité juridique de conclure cet accord.
9. Je déclare respecter les lois régissant la publicité commerciale dans mon pays.
10. Je déclare que mes informations et plateformes sont authentiques.

**4. Commissions**
11. Je comprends que les commissions sont versées selon la politique de l'entreprise après vérification.
12. J'accepte que l'entreprise puisse réviser le programme avec préavis.

**5. Résiliation**
13. Je comprends que l'entreprise peut mettre fin à ma participation en cas de violation.

En cliquant sur « J'accepte et assume l'entière responsabilité », je confirme avoir lu, compris et accepté l'ensemble des conditions.
  `.trim(),
} as const;

export type ConsentLocale = keyof typeof CREATOR_CONSENT_TEXT;

export function getConsentText(locale: string): string {
  if (locale === "en" || locale === "fr") return CREATOR_CONSENT_TEXT[locale];
  return CREATOR_CONSENT_TEXT.ar;
}

export function getConsentVersion(): string {
  return CREATOR_CONSENT_VERSION;
}

export function needsCreatorConsent(profile: {
  consentGiven: boolean;
  consentVersion: string | null;
} | null): boolean {
  if (!profile?.consentGiven) return true;
  return profile.consentVersion !== CREATOR_CONSENT_VERSION;
}

export function hasActiveCreatorConsent(profile: {
  consentGiven: boolean;
  consentVersion: string | null;
} | null | undefined): boolean {
  return Boolean(
    profile?.consentGiven && profile.consentVersion === CREATOR_CONSENT_VERSION,
  );
}

export type ConsentSection = { title: string; items: string[] };

export function parseConsentSections(text: string): ConsentSection[] {
  const sections: ConsentSection[] = [];
  let current: ConsentSection | null = null;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const sectionMatch = line.match(/^\*\*(.+)\*\*$/);
    if (sectionMatch) {
      current = { title: sectionMatch[1] ?? line, items: [] };
      sections.push(current);
      continue;
    }

    const itemMatch = line.match(/^[\d٠-٩]+[\.\)]\s*(.+)$/);
    if (itemMatch && current) {
      current.items.push(itemMatch[1] ?? line);
    } else if (current && !line.startsWith("**")) {
      current.items.push(line);
    }
  }

  return sections;
}
