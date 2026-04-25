import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPartnerDashboard } from "@/lib/growth/get-dashboard";
import { ProductMarketingPlaybook } from "@/components/growth/ProductMarketingPlaybook";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function GrowthKitProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/growth/sign-in`);
  }
  if (session.user.role === "ADMIN") {
    redirect(`/${locale}/growth/admin`);
  }

  const data = await getPartnerDashboard(session.user.id);
  const product = data.products.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <div className="space-y-5">
      <Link
        href={`/${locale}/growth`}
        className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/75 hover:border-gold/30 hover:text-white"
      >
        ← العودة للوحة
      </Link>

      <ProductMarketingPlaybook
        locale={locale}
        productName={product.name}
        productSlug={product.slug}
        priceCents={product.priceCents}
        commissionBaseCents={product.commissionBaseCents}
        marketingKit={product.marketingKit}
      />
    </div>
  );
}
