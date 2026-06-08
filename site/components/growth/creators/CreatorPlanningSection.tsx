"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { CreatorContentCalendar } from "./CreatorContentCalendar";
import { saveContentIdeasAction } from "@/lib/growth/creator-arena-actions";

type Idea = { id: string; title: string; column: string; platform: string; priority: string };

type Props = {
  userId: string;
  contentIdeas: Idea[];
};

const COLUMNS = ["ideas", "progress", "published"] as const;

export function CreatorPlanningSection({ userId, contentIdeas: initial }: Props) {
  const t = useTranslations("Creators.planning");
  const [ideas, setIdeas] = useState(initial);
  const [newTitle, setNewTitle] = useState("");
  const [goals, setGoals] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(`creator-goals-${userId}`) ?? "[]") as string[];
    } catch {
      return [];
    }
  });
  const [goalInput, setGoalInput] = useState("");
  const [, saveAction, pending] = useActionState(saveContentIdeasAction, undefined);

  function persistGoals(next: string[]) {
    setGoals(next);
    localStorage.setItem(`creator-goals-${userId}`, JSON.stringify(next));
  }

  function addIdea() {
    if (!newTitle.trim()) return;
    const next = [
      ...ideas,
      { id: `i-${Date.now()}`, title: newTitle.trim(), column: "ideas", platform: "instagram", priority: "mid" },
    ];
    setIdeas(next);
    setNewTitle("");
    const fd = new FormData();
    fd.set("ideas", JSON.stringify(next));
    void saveAction(fd);
  }

  return (
    <div className="space-y-4">
      <CreatorContentCalendar />
      <GlassCard className="creator-card p-5">
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">{t("ideasTitle")}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] font-bold uppercase text-white/45">{t(`column.${col}`)}</p>
              <ul className="mt-2 space-y-2">
                {ideas.filter((i) => i.column === col).map((i) => (
                  <li key={i.id} className="rounded-lg border border-white/10 px-2 py-1.5 text-xs text-white/80">
                    {i.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={t("ideaPlaceholder")} className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
          <GoldButton type="button" disabled={pending} onClick={addIdea}>{t("addIdea")}</GoldButton>
        </div>
      </GlassCard>
      <GlassCard className="creator-card p-5">
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">{t("goalsTitle")}</h2>
        <ul className="mt-3 space-y-2">
          {goals.map((g, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" onChange={() => persistGoals(goals.filter((_, j) => j !== i))} />
              {g}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input value={goalInput} onChange={(e) => setGoalInput(e.target.value)} className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder={t("goalPlaceholder")} />
          <GoldButton type="button" onClick={() => { if (goalInput.trim()) { persistGoals([...goals, goalInput.trim()]); setGoalInput(""); } }}>{t("addGoal")}</GoldButton>
        </div>
        <p className="mt-2 text-[11px] text-white/45">{t("goalsProgress", { done: 0, total: goals.length })}</p>
      </GlassCard>
    </div>
  );
}
