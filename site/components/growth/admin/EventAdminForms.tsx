"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ImageUpload } from "@/components/growth/ui/ImageUpload";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { EventCard, type EventCardData } from "@/components/growth/events/EventCard";
import {
  adminCreateEventAction,
  adminDeleteEventAction,
  adminUpdateEventAction,
} from "@/lib/growth/actions";

type MilestoneDraft = {
  title: string;
  description: string;
  xpReward: number;
  requiredProgress: number;
};

function eventErrorText(t: (k: string) => string, code: string) {
  const key = `errors.${code}`;
  try {
    const msg = t(key as "errors.invalid_input");
    if (msg && msg !== key) return msg;
  } catch {
    /* fallback */
  }
  return code;
}

export function CreateEventForm({ locale }: { locale: string }) {
  const t = useTranslations("Growth.admin.events");
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [eventStatus, setEventStatus] = useState("DRAFT");
  const [coverImage, setCoverImage] = useState("");
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    { title: "", description: "", xpReward: 50, requiredProgress: 25 },
  ]);

  function addMilestone() {
    if (milestones.length >= 5) return;
    setMilestones((m) => [...m, { title: "", description: "", xpReward: 0, requiredProgress: 0 }]);
  }

  function moveMilestone(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= milestones.length) return;
    setMilestones((m) => {
      const next = [...m];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    setPending(true);
    const fd = new FormData();
    fd.set("title", title);
    fd.set("description", description);
    fd.set("rules", rules);
    fd.set("startAt", startAt);
    fd.set("endAt", endAt);
    fd.set("maxParticipants", maxParticipants);
    fd.set("status", eventStatus);
    if (coverImage) fd.set("coverImage", coverImage);
    fd.set(
      "milestonesJson",
      JSON.stringify(
        milestones
          .filter((m) => m.title.trim())
          .map((m, order) => ({ ...m, order })),
      ),
    );
    try {
      const res = await adminCreateEventAction(fd);
      if (res.ok) {
        setStatus("ok");
        router.refresh();
      } else {
        setStatus(eventErrorText(t, res.error));
      }
    } catch {
      setStatus(eventErrorText(t, "server_error"));
    } finally {
      setPending(false);
    }
  }

  const preview: EventCardData = {
    slug: "preview",
    title: title || t("previewTitle"),
    description: description || t("previewDesc"),
    coverImage: coverImage || null,
    status: eventStatus,
    startAt: startAt || new Date().toISOString(),
    endAt: endAt || null,
    participantCount: 0,
    milestoneCount: milestones.filter((m) => m.title.trim()).length,
    totalXp: milestones.reduce((s, m) => s + (m.xpReward || 0), 0),
    locale,
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-xs text-[var(--growth-text-sub)]">{t("coverImage")}</span>
          <div className="mt-2">
            <ImageUpload
              value={coverImage}
              onChange={setCoverImage}
              aspectRatio="16/9"
              maxEdge={640}
              jpegQuality={0.78}
              placeholder={t("coverPlaceholder")}
              hint="PNG, JPG · 2MB"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-xs text-[var(--growth-text-sub)]">{t("title")}</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-lg font-bold text-white"
          />
        </label>
        <label className="block">
          <span className="text-xs text-[var(--growth-text-sub)]">{t("description")}</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white"
          />
        </label>
        <label className="block">
          <span className="text-xs text-[var(--growth-text-sub)]">{t("rules")}</span>
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            rows={6}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 font-mono text-xs text-white"
            placeholder="Markdown"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="text-xs text-[var(--growth-text-sub)]">{t("startAt")}</span>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white"
            />
          </label>
          <label>
            <span className="text-xs text-[var(--growth-text-sub)]">{t("endAt")}</span>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white"
            />
          </label>
          <label>
            <span className="text-xs text-[var(--growth-text-sub)]">{t("maxParticipants")}</span>
            <input
              type="number"
              min={1}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white"
            />
          </label>
          <label>
            <span className="text-xs text-[var(--growth-text-sub)]">{t("status")}</span>
            <select
              value={eventStatus}
              onChange={(e) => setEventStatus(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </label>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">{t("milestones")}</span>
            <button
              type="button"
              onClick={addMilestone}
              disabled={milestones.length >= 5}
              className="text-xs font-semibold text-gold"
            >
              + {t("addMilestone")}
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {milestones.map((m, i) => (
              <GlassCard key={i} className="p-3">
                <div className="flex gap-2">
                  <input
                    value={m.title}
                    onChange={(e) => {
                      const next = [...milestones];
                      next[i] = { ...m, title: e.target.value };
                      setMilestones(next);
                    }}
                    placeholder={t("milestoneTitle")}
                    className="flex-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm text-white"
                  />
                  <input
                    type="number"
                    value={m.xpReward}
                    onChange={(e) => {
                      const next = [...milestones];
                      next[i] = { ...m, xpReward: Number(e.target.value) };
                      setMilestones(next);
                    }}
                    className="w-16 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm text-white"
                    title="XP"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={m.requiredProgress}
                    onChange={(e) => {
                      const next = [...milestones];
                      next[i] = { ...m, requiredProgress: Number(e.target.value) };
                      setMilestones(next);
                    }}
                    className="w-16 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm text-white"
                    title="%"
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => moveMilestone(i, -1)} className="text-xs text-white/50">
                    ↑
                  </button>
                  <button type="button" onClick={() => moveMilestone(i, 1)} className="text-xs text-white/50">
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setMilestones((ms) => ms.filter((_, j) => j !== i))}
                    className="ms-auto text-xs text-rose-300"
                  >
                    ×
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
        {status === "ok" ? <p className="text-sm text-emerald-300">{t("created")}</p> : null}
        {status && status !== "ok" ? (
          <p className="text-sm text-rose-300" role="alert">
            {status}
          </p>
        ) : null}
        <GoldButton type="submit" disabled={pending}>
          {pending ? "…" : t("createSubmit")}
        </GoldButton>
      </form>

      <div className="lg:sticky lg:top-24">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gold">{t("livePreview")}</p>
        <EventCard
          event={preview}
          joinLabel={t("previewJoin")}
          viewLabel={t("previewView")}
        />
      </div>
    </div>
  );
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type AdminEventRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  rules: string;
  startAt: string;
  endAt: string | null;
  maxParticipants: number | null;
  coverImage: string | null;
  participantCount: number;
  milestones: MilestoneDraft[];
};

export function EditEventForm({ event, locale }: { event: AdminEventRow; locale: string }) {
  const t = useTranslations("Growth.admin.events");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [rules, setRules] = useState(event.rules);
  const [slug, setSlug] = useState(event.slug);
  const [startAt, setStartAt] = useState(toLocalDatetime(event.startAt));
  const [endAt, setEndAt] = useState(event.endAt ? toLocalDatetime(event.endAt) : "");
  const [maxParticipants, setMaxParticipants] = useState(
    event.maxParticipants != null ? String(event.maxParticipants) : "",
  );
  const [coverImage, setCoverImage] = useState(event.coverImage ?? "");
  const [milestones, setMilestones] = useState<MilestoneDraft[]>(
    event.milestones.length > 0
      ? event.milestones
      : [{ title: "", description: "", xpReward: 50, requiredProgress: 25 }],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    const fd = new FormData();
    fd.set("eventId", event.id);
    fd.set("title", title);
    fd.set("description", description);
    fd.set("rules", rules);
    fd.set("slug", slug);
    fd.set("startAt", startAt);
    fd.set("endAt", endAt);
    fd.set("maxParticipants", maxParticipants);
    fd.set("coverImage", coverImage || "__keep__");
    fd.set(
      "milestonesJson",
      JSON.stringify(
        milestones.filter((m) => m.title.trim()).map((m, order) => ({ ...m, order })),
      ),
    );
    const res = await adminUpdateEventAction(fd);
    if (res.ok) setStatus("ok");
    else setStatus(res.error);
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-bold text-gold hover:underline"
      >
        {open ? t("collapseEdit") : t("editEvent")}
      </button>
      {open ? (
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs text-white/50">{t("slug")}</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={event.participantCount > 0}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white disabled:opacity-50"
            />
          </label>
          <label className="block">
            <span className="text-xs text-white/50">{t("title")}</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            required
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-white"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <ImageUpload
            value={coverImage}
            onChange={setCoverImage}
            aspectRatio="16/9"
            placeholder={t("coverPlaceholder")}
          />
          {status === "ok" ? <p className="text-xs text-emerald-300">{t("updated")}</p> : null}
          {status && status !== "ok" ? <p className="text-xs text-rose-300">{status}</p> : null}
          <GoldButton type="submit">{t("saveEvent")}</GoldButton>
        </form>
      ) : null}
    </div>
  );
}

export function DeleteEventButton({
  eventId,
  participantCount,
}: {
  eventId: string;
  participantCount: number;
}) {
  const t = useTranslations("Growth.admin.events");
  const [status, setStatus] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  async function onDelete() {
    setStatus(null);
    const fd = new FormData();
    fd.set("eventId", eventId);
    if (participantCount > 0) fd.set("confirm", "DELETE");
    const res = await adminDeleteEventAction(fd);
    if (res.ok) window.location.reload();
    else setStatus(res.error);
  }

  return (
    <div className="mt-2">
      {!confirm ? (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="text-[10px] font-bold text-rose-300 hover:underline"
        >
          {t("deleteEvent")}
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-rose-200">{t("deleteConfirm")}</span>
          <button
            type="button"
            onClick={() => void onDelete()}
            className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-2 py-1 text-[10px] font-bold text-rose-100"
          >
            {t("deleteYes")}
          </button>
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="text-[10px] text-white/50"
          >
            {t("cancel")}
          </button>
        </div>
      )}
      {status ? <p className="mt-1 text-[10px] text-rose-300">{status}</p> : null}
    </div>
  );
}
