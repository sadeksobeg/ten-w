import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "ErrorPage" });
  const home = await getTranslations({ locale, namespace: "Common" });

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/80">404</p>
      <h1 className="mt-3 font-[family-name:var(--font-cairo)] text-2xl font-bold text-foreground">
        {t("notFoundTitle")}
      </h1>
      <p className="mt-3 text-muted">{t("notFoundBody")}</p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright"
      >
        {home("backHome")}
      </Link>
    </div>
  );
}
