import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { OrderPageClient } from "@/components/order/OrderPageClient";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { getPublicProducts } from "@/lib/growth/public-products";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "OrderPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/order"),
  };
}

export default async function OrderPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const products = await getPublicProducts(locale);

  return (
    <main className="min-h-screen bg-[#050508] px-4 py-16 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,160,97,0.08)_0%,transparent_55%)]"
        aria-hidden
      />
      <OrderPageClient products={products} />
    </main>
  );
}
