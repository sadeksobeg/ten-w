"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { adminCreateEventAction } from "@/lib/growth/actions";

type MilestoneDraft = {
  title: string;
  description: string;
  xpReward: number;
  requiredProgress: number;
};

export function CreateEventForm() {
  const t = useTranslations("Growth.admin.events");
  const [status, setStatus] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    { title: "", description: "", xpReward: 50, requiredProgress: 25 },
  ]);

  function addMilestone() {
    if (milestones.length >= 5) return;
    setMilestones((m) => [...m, { title: "", description: "", xpReward: 0, requiredProgress: 0 }]);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    fd.set(
      "milestonesJson",
      JSON.stringify(
        milestones
          .filter((m) => m.title.trim())
          .map((m, order) => ({ ...m, order })),
      ),
    );
    const res = await adminCreateEventAction(fd);
    if (res.ok) setStatus("ok");
    else setStatus(res.error);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs text-white/55">{t("title")}</span>
          <input name="title" required className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs text-white/55">{t("description")}</span>
          <textarea name="description" required rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs text-white/55">{t("rules")}</span>
          <textarea name="rules" required rows={6} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white font-mono text-xs" />
        </label>
        <label>
          <span className="text-xs text-white/55">{t("startAt")}</span>
          <input name="startAt" type="datetime-local" required className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
        </label>
        <label>
          <span className="text-xs text-white/55">{t("endAt")}</span>
          <input name="endAt" type="datetime-local" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
        </label>
        <label>
          <span className="text-xs text-white/55">{t("maxParticipants")}</span>
          <input name="maxParticipants" type="number" min={1} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
        </label>
        <label>
          <span className="text-xs text-white/55">{t("status")}</span>
          <select name="status" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white">
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">{t("milestones")}</span>
          <button type="button" onClick={addMilestone} className="text-xs text-gold">
            + {t("addMilestone")}
          </button>
        </div>
        {milestones.map((m, i) => (
          <div key={i} className="mt-3 grid gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-4">
            <input
              placeholder={t("milestoneTitle")}
              value={m.title}
              onChange={(e) => {
                const next = [...milestones];
                next[i] = { ...m, title: e.target.value };
                setMilestones(next);
              }}
              className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm text-white sm:col-span-2"
            />
            <input
              type="number"
              placeholder="XP"
              value={m.xpReward}
              onChange={(e) => {
                const next = [...milestones];
                next[i] = { ...m, xpReward: Number(e.target.value) };
                setMilestones(next);
              }}
              className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm text-white"
            />
            <input
              type="number"
              min={0}
              max={100}
              placeholder="%"
              value={m.requiredProgress}
              onChange={(e) => {
                const next = [...milestones];
                next[i] = { ...m, requiredProgress: Number(e.target.value) };
                setMilestones(next);
              }}
              className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm text-white"
            />
          </div>
        ))}
      </div>

      {status === "ok" ? <p className="text-sm text-emerald-300">{t("created")}</p> : null}
      {status && status !== "ok" ? <p className="text-sm text-red-300">{status}</p> : null}

      <button type="submit" className="rounded-xl bg-gradient-to-r from-gold/30 via-gold to-gold-bright px-6 py-3 text-sm font-extrabold text-bg">
        {t("createSubmit")}
      </button>
    </form>
  );
}
