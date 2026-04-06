import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Common" });

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-bold text-foreground">
        404
      </h1>
      <p className="mt-2 text-muted">
        <Link href="/" className="text-gold hover:underline">
          {t("backHome")}
        </Link>
      </p>
    </div>
  );
}
