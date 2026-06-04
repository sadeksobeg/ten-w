import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { upsertVaultItemAdminFormAction } from "@/lib/growth/engagement-actions";

export default async function AdminVaultPage() {
  const t = await getTranslations("Growth.admin.vaultPage");
  const items = await prisma.vaultItem.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("title")}</h1>
      <p className="text-sm text-white/65">{t("hint")}</p>

      <form action={upsertVaultItemAdminFormAction} className="space-y-3 rounded-2xl border border-white/10 p-4">
        <h2 className="text-sm font-bold text-gold">{t("add")}</h2>
        <input name="slug" placeholder="slug" required className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
        <input name="titleAr" placeholder="titleAr" required className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
        <input name="titleEn" placeholder="titleEn" required className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
        <textarea name="descAr" required className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" rows={2} />
        <textarea name="descEn" required className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" rows={2} />
        <textarea name="contentAr" required className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" rows={4} />
        <textarea name="contentEn" required className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" rows={4} />
        <input
          name="unlockCriteriaJson"
          defaultValue='{"type":"deals","value":5}'
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white font-mono"
        />
        <button type="submit" className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-black">
          {t("save")}
        </button>
      </form>

      <ul className="space-y-2 text-sm text-white/80">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-white/10 px-3 py-2">
            <span className="font-mono text-gold">{item.slug}</span> — {item.titleEn}
            {!item.isActive ? <span className="ms-2 text-rose-400">(off)</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
