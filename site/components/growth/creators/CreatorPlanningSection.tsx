"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { CreatorContentCalendar } from "./CreatorContentCalendar";
import { saveContentIdeasAction } from "@/lib/growth/creator-arena-actions";

type Idea = { id: string; title: string; column: string; platform: string; priority: string };

type ContentSeries = {
  type: "series";
  id: string;
  name: string;
  target: number;
  completed: number;
  episodes: string[];
};

type StoredItem = Idea | ContentSeries;

function isSeries(item: StoredItem): item is ContentSeries {
  return "type" in item && item.type === "series";
}

type Props = {
  userId: string;
  contentIdeas: Array<
    | { id: string; title: string; column: string; platform: string; priority: string }
    | { type: "series"; id: string; name: string; target: number; completed: number; episodes: string[] }
  >;
};

const COLUMNS = ["ideas", "progress", "published"] as const;

export function CreatorPlanningSection({ userId, contentIdeas: initial }: Props) {
  const t = useTranslations("Creators.planning");
  const [ideas, setIdeas] = useState<StoredItem[]>(initial);
  const [newTitle, setNewTitle] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [seriesTarget, setSeriesTarget] = useState(10);
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

  const boardIdeas = ideas.filter((i): i is Idea => !isSeries(i));
  const series = ideas.filter(isSeries);

  function persist(next: StoredItem[]) {
    setIdeas(next);
    const fd = new FormData();
    fd.set("ideas", JSON.stringify(next));
    void saveAction(fd);
  }

  function persistGoals(next: string[]) {
    setGoals(next);
    localStorage.setItem(`creator-goals-${userId}`, JSON.stringify(next));
  }

  function addIdea() {
    if (!newTitle.trim()) return;
    persist([
      ...ideas,
      { id: `i-${Date.now()}`, title: newTitle.trim(), column: "ideas", platform: "instagram", priority: "mid" },
    ]);
    setNewTitle("");
  }

  function addSeries() {
    if (!seriesName.trim()) return;
    persist([
      ...ideas,
      {
        type: "series",
        id: `s-${Date.now()}`,
        name: seriesName.trim(),
        target: Math.max(1, seriesTarget),
        completed: 0,
        episodes: [],
      },
    ]);
    setSeriesName("");
    setSeriesTarget(10);
  }

  function toggleEpisode(seriesId: string, episode: string) {
    persist(
      ideas.map((item) => {
        if (!isSeries(item) || item.id !== seriesId) return item;
        const done = item.episodes.includes(episode);
        const episodes = done
          ? item.episodes.filter((e) => e !== episode)
          : [...item.episodes, episode];
        const completed = Math.min(item.target, episodes.length);
        return { ...item, episodes, completed };
      }),
    );
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
                {boardIdeas.filter((i) => i.column === col).map((i) => (
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
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">{t("seriesTitle")}</h2>
        <p className="mt-1 text-xs text-white/45">{t("seriesSubtitle")}</p>
        {series.length === 0 ? (
          <p className="mt-3 text-sm text-white/45">{t("seriesEmpty")}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {series.map((s) => (
              <li key={s.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-white">{s.name}</p>
                  <span className="text-xs font-bold text-[var(--creator-secondary)]">
                    {t("seriesProgress", { done: s.completed, total: s.target })}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--creator-primary)] to-[var(--creator-secondary)] transition-[width]"
                    style={{ width: `${Math.min(100, (s.completed / s.target) * 100)}%` }}
                  />
                </div>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {Array.from({ length: s.target }, (_, i) => {
                    const ep = `E${i + 1}`;
                    const done = s.episodes.includes(ep);
                    return (
                      <button
                        key={ep}
                        type="button"
                        onClick={() => toggleEpisode(s.id, ep)}
                        className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                          done
                            ? "bg-emerald-500/20 text-emerald-200"
                            : "bg-white/5 text-white/45 hover:bg-white/10"
                        }`}
                      >
                        {ep}
                      </button>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={seriesName}
            onChange={(e) => setSeriesName(e.target.value)}
            placeholder={t("seriesNamePlaceholder")}
            className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          />
          <input
            type="number"
            min={1}
            max={30}
            value={seriesTarget}
            onChange={(e) => setSeriesTarget(Number(e.target.value) || 10)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white sm:w-24"
            aria-label={t("seriesTargetLabel")}
          />
          <GoldButton type="button" disabled={pending} onClick={addSeries}>
            {t("addSeries")}
          </GoldButton>
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
