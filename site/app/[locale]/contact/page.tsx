import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Section } from "@/components/ui/Section";
import type { Locale } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ intent?: string; topic?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContactPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/contact"),
  };
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ContactPage" });
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_E164;
  const waHref = wa
    ? `https://wa.me/${wa.replace(/\+/g, "")}`
    : null;

  return (
    <>
      <Section className="border-b border-white/10 pb-12 pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-bold md:text-4xl">
          {t("hero.title")}
        </h1>
        <p className="mt-4 max-w-3xl text-muted md:text-lg">{t("hero.body")}</p>
        <p className="mt-3 text-muted">{t("hero.subtitle")}</p>
        <p className="mt-2 text-sm text-muted">{t("hero.slaNote")}</p>
        <p className="mt-2 text-sm text-muted">{t("regionalNote")}</p>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("formHeading")}
            </h2>
            <ContactForm
              defaultIntent={sp.intent}
              defaultTopic={sp.topic}
            />
          </div>
          <div className="space-y-6 text-sm text-muted">
            <div>
              <h3 className="text-sm font-semibold text-gold">{t("address")}</h3>
              <p className="mt-2 whitespace-pre-line">{t("addressLine")}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gold">{t("phoneLabel")}</h3>
              <p className="mt-2">
                <a
                  href={`tel:${t("phoneRaw")}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {t("phoneDisplay")}
                </a>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gold">{t("hours")}</h3>
              <p className="mt-2">
                {locale === "ar"
                  ? "الأحد–الخميس، ساعات العمل الرسمية"
                  : "Sun–Thu, business hours"}
              </p>
            </div>
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-md border border-gold/50 px-4 py-2 font-semibold text-gold hover:bg-gold-dim"
              >
                {t("whatsapp")}
              </a>
            ) : null}
            <p className="text-xs">
              {getSiteUrl().origin}
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
