import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnalyticsConsent } from "@/components/analytics/AnalyticsConsent";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { AsyncGoogleFonts } from "@/components/layout/AsyncGoogleFonts";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LazyCustomCursor } from "@/components/layout/LazyCustomCursor";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { SoundProvider } from "@/components/sound/SoundProvider";
import { routing, type Locale } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const base = getSiteUrl();

  return {
    metadataBase: base,
    title: {
      default:
        locale === "ar"
          ? "T.E.N.E.G.T.A – أنظمة ذكاء اصطناعي وهندسة برمجيات للمؤسسات"
          : "T.E.N.E.G.T.A – AI systems & enterprise software engineering",
      template: "%s | T.E.N.E.G.T.A",
    },
    description:
      locale === "ar"
        ? "نصمّم ونسلّم أنظمة ذكاء اصطناعي قابلة للتشغيل، وأمن سيبراني، وبرمجيات متكاملة عبر قطاعات متعددة."
        : "Deployable AI systems, cybersecurity, and integrated software — multi-sector delivery from pilot to production.",
    alternates: {
      canonical: `${base.origin}/${locale}`,
      languages: {
        "x-default": `${base.origin}/ar`,
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `${base.origin}/${l}`]),
        ),
      },
    },
    openGraph: {
      type: "website",
      locale:
        locale === "ar" ? "ar_SA" : locale === "fr" ? "fr_FR" : "en_US",
      siteName: "T.E.N.E.G.T.A",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const isLtr = locale === "en" || locale === "fr";

  return (
    <html
      lang={locale}
      dir={isLtr ? "ltr" : "rtl"}
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <AsyncGoogleFonts />
        {locale === "ar" || locale === "fr" ? (
          <link
            rel="preload"
            as="style"
            href="https://fonts.googleapis.com/css2?family=Cairo:wght@700&display=swap"
          />
        ) : null}
      </head>
      <body
        className={`min-h-full flex flex-col bg-bg text-foreground ${
          isLtr ? "[font-family:var(--font-inter)]" : "font-sans"
        }`}
      >
        <AmbientBackground />
        <LazyCustomCursor />
        <NextIntlClientProvider messages={messages}>
            <SoundProvider>
              <SmoothScroll>
                <a
                  href="#main"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:z-[100] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-bg"
                >
                  {locale === "ar"
                    ? "تخطي إلى المحتوى"
                    : locale === "fr"
                      ? "Aller au contenu"
                      : "Skip to content"}
                </a>
                <Header />
                <main id="main" className="relative flex-1">
                  {children}
                </main>
                <Footer />
                <AnalyticsConsent />
              </SmoothScroll>
            </SoundProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
