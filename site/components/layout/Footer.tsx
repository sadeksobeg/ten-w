import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SoundToggle } from "@/components/sound/SoundToggle";

export async function Footer() {
  const t = await getTranslations("Footer");
  const n = await getTranslations("Nav");
  const year = new Date().getFullYear();
  const linkedIn =
    process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN?.trim() ||
    "https://www.linkedin.com/in/sadek-al-etr-084b34205";
  const x = process.env.NEXT_PUBLIC_SOCIAL_X?.trim();

  return (
    <footer className="border-t border-white/10 bg-surface py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
        <div>
          <p className="font-[family-name:var(--font-cairo)] text-lg font-bold text-gold">
            T.E.N.E.G.T.A
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted">{t("tagline")}</p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <Link href="/case-studies" className="text-muted hover:text-gold">
            {t("caseStudies")}
          </Link>
          <Link href="/engagement" className="text-muted hover:text-gold">
            {t("engagement")}
          </Link>
          <Link href="/why-us" className="text-muted hover:text-gold">
            {t("whyUs")}
          </Link>
          <Link href="/partners" className="text-muted hover:text-gold">
            {t("partners")}
          </Link>
          <Link href="/careers" className="text-muted hover:text-gold">
            {t("careers")}
          </Link>
          <Link href="/tech-radar" className="text-muted hover:text-gold">
            {t("techRadar")}
          </Link>
          <Link href="/legal" className="text-muted hover:text-gold">
            {n("legal")}
          </Link>
          <Link href="/privacy" className="text-muted hover:text-gold">
            {t("privacy")}
          </Link>
          <Link href="/terms" className="text-muted hover:text-gold">
            {t("terms")}
          </Link>
          <Link href="/contact" className="text-muted hover:text-gold">
            {n("contact")}
          </Link>
          <a
            href={linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-gold"
          >
            LinkedIn
          </a>
          {x ? (
            <a
              href={x}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-gold"
            >
              X
            </a>
          ) : null}
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-3 text-center text-xs text-muted sm:flex-row sm:justify-center sm:gap-6">
        <SoundToggle />
        <span>
          © {year} T.E.N.E.G.T.A — {t("rights")}
        </span>
      </div>
    </footer>
  );
}
