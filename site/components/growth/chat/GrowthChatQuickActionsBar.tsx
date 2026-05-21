"use client";

import { useTranslations } from "next-intl";
import type { ChatSuggestionItem } from "@/lib/growth/chat-suggestions";

type Template = ChatSuggestionItem["suggestTemplate"];

type Props = {
  suggestions: ChatSuggestionItem[];
  disabled?: boolean;
  onSuggest: (tpl: Template) => void;
};

export function GrowthChatQuickActionsBar({
  suggestions,
  disabled,
  onSuggest,
}: Props) {
  const t = useTranslations("Growth.chat");
  const ti = useTranslations("Growth.chat.intelligence");

  if (suggestions.length === 0) return null;

  const primary = suggestions[0]!;
  const rest = suggestions.slice(1, 5);

  return (
    <div className="shrink-0 border-t border-white/10 bg-[#070b18]/95 px-3 py-2.5 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
          {t("quickActionsLabel")}
        </span>
        <span className="text-[9px] font-semibold tabular-nums text-emerald-300/90">
          {ti("directiveImpactHint", { n: primary.impactCloseDelta })}
        </span>
      </div>
      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSuggest(primary.suggestTemplate)}
          className="shrink-0 rounded-full bg-gradient-to-r from-gold/35 to-gold/15 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-[0_0_16px_rgba(234,179,8,0.15)] ring-1 ring-gold/40 transition hover:scale-[1.03] active:scale-95 disabled:opacity-40"
        >
          {ti(primary.labelKey as "suggestPushCloseHi")}
        </button>
        {rest.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={disabled}
            onClick={() => onSuggest(s.suggestTemplate)}
            className="shrink-0 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-white/80 transition hover:border-gold/30 hover:text-white active:scale-95 disabled:opacity-40"
          >
            {ti(s.labelKey as "suggestPushCloseHi")}
          </button>
        ))}
      </div>
    </div>
  );
}
