import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getFeaturedPartners } from "@/lib/growth/get-featured-partners";

type Props = { locale: string };

export async function HomeFeaturedPartners({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: "HomePage.featuredPartners" });
  const partners = await getFeaturedPartners(3);
  if (partners.length === 0) return null;

  return (
    <section className="border-y border-white/10 bg-surface/20 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-cairo)] text-xl font-extrabold md:text-2xl">
          {t("title")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t("subtitle")}</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {partners.map((p) => (
            <li key={p.publicSlug}>
              <Link
                href={`/growth/profile/${p.publicSlug}`}
                className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-gold/35"
              >
                <p className="font-semibold text-white">{p.name}</p>
                <p className="mt-1 text-xs text-gold/80">{p.levelName}</p>
                <p className="mt-2 text-xs text-muted">
                  {t("closedDeals", { n: p.closedDeals })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
