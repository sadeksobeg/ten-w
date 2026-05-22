import { EventStatus, NotificationType, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotificationsForAllActivePartners } from "@/lib/growth/notify";
import { uniqueEventSlug } from "@/lib/growth/event-slug";
import { saveEventCoverToPublic } from "@/lib/growth/event-cover-storage";
import { isMissingCoverColumn, prismaErrorKey } from "@/lib/growth/prisma-error-code";
import { resolveAdminUserId } from "@/lib/growth/resolve-admin-user";

export type AdminCreateEventPayload = {
  title: string;
  description: string;
  rules?: string;
  startAt: string;
  endAt?: string;
  maxParticipants?: string;
  status?: string;
  coverImage?: string;
  milestonesJson?: string;
};

function parseMilestones(milestonesJson: string) {
  const parsed = JSON.parse(milestonesJson) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed.slice(0, 5).map((m, i) => {
    const row = m as Record<string, unknown>;
    return {
      title: String(row.title ?? `Milestone ${i + 1}`),
      description: row.description ? String(row.description) : undefined,
      xpReward: Number(row.xpReward) || 0,
      order: i,
      requiredProgress: Math.min(100, Math.max(0, Number(row.requiredProgress) || 0)),
    };
  });
}

function revalidateGrowth() {
  revalidatePath("/", "layout");
}

export async function createAdminEvent(
  payload: AdminCreateEventPayload,
  actorUserId: string,
  actorEmail?: string | null,
): Promise<
  | { ok: true; eventId: string; slug: string; coverWarning?: string }
  | { ok: false; error: string }
> {
  const creatorId = await resolveAdminUserId(actorUserId, actorEmail);
  if (!creatorId) return { ok: false, error: "invalid_creator" };

  const title = payload.title.trim();
  const description = payload.description.trim();
  const rules = (payload.rules ?? "").trim() || "—";
  const startAtRaw = payload.startAt.trim();
  const endAtRaw = (payload.endAt ?? "").trim();
  const maxRaw = (payload.maxParticipants ?? "").trim();
  const statusRaw = (payload.status ?? "DRAFT").trim();

  if (!title || !description || !startAtRaw) {
    return { ok: false, error: "invalid_input" };
  }

  const startAt = new Date(startAtRaw);
  if (Number.isNaN(startAt.getTime())) return { ok: false, error: "invalid_date" };

  const endAt = endAtRaw ? new Date(endAtRaw) : null;
  if (endAt && Number.isNaN(endAt.getTime())) return { ok: false, error: "invalid_date" };

  const maxParticipants = maxRaw ? Number(maxRaw) : null;
  if (maxParticipants != null && (!Number.isFinite(maxParticipants) || maxParticipants < 1)) {
    return { ok: false, error: "invalid_max" };
  }

  const status =
    statusRaw === "PUBLISHED" ? EventStatus.PUBLISHED : EventStatus.DRAFT;

  let milestones: ReturnType<typeof parseMilestones> = [];
  try {
    milestones = parseMilestones(payload.milestonesJson ?? "[]");
  } catch {
    return { ok: false, error: "invalid_milestones" };
  }

  let slug: string;
  try {
    slug = await uniqueEventSlug(title);
  } catch {
    return { ok: false, error: "slug_taken" };
  }

  const coverRaw = (payload.coverImage ?? "").trim();
  let coverWarning: string | undefined;

  let event: { id: string };
  try {
    event = await prisma.growthEvent.create({
      data: {
        slug,
        title,
        description,
        rules,
        startAt,
        endAt,
        maxParticipants,
        coverImage: null,
        status,
        createdById: creatorId,
      },
      select: { id: true },
    });
  } catch (err) {
    console.error("[createAdminEvent] create", err);
    return { ok: false, error: prismaErrorKey(err) };
  }

  if (coverRaw) {
    if (!coverRaw.startsWith("data:image/")) {
      return { ok: false, error: "invalid_image" };
    }
    if (coverRaw.length > 1_500_000) {
      return { ok: false, error: "image_too_large" };
    }
    try {
      const publicPath = await saveEventCoverToPublic(event.id, coverRaw);
      await prisma.growthEvent.update({
        where: { id: event.id },
        data: { coverImage: publicPath },
      });
    } catch (fileErr) {
      console.error("[createAdminEvent] cover file", fileErr);
      try {
        await prisma.growthEvent.update({
          where: { id: event.id },
          data: { coverImage: coverRaw },
        });
      } catch (dbErr) {
        console.error("[createAdminEvent] cover db", dbErr);
        if (isMissingCoverColumn(dbErr)) {
          coverWarning = "cover_skipped";
        } else {
          coverWarning = "cover_skipped";
        }
      }
    }
  }

  if (milestones.length > 0) {
    try {
      await prisma.eventMilestone.createMany({
        data: milestones.map((m) => ({
          eventId: event.id,
          title: m.title,
          description: m.description ?? null,
          xpReward: m.xpReward,
          order: m.order,
          requiredProgress: m.requiredProgress,
        })),
      });
    } catch (mErr) {
      console.error("[createAdminEvent] milestones", mErr);
      await prisma.growthEvent.delete({ where: { id: event.id } }).catch(() => undefined);
      return { ok: false, error: prismaErrorKey(mErr) };
    }
  }

  try {
    revalidateGrowth();
  } catch (revalidateErr) {
    console.error("[createAdminEvent] revalidate", revalidateErr);
  }

  if (status === EventStatus.PUBLISHED) {
    void createNotificationsForAllActivePartners({
      type: NotificationType.EVENT_INVITE,
      title: `فعالية جديدة: ${title}`,
      body: description.slice(0, 200),
      link: `/growth/events/${slug}`,
      eventId: event.id,
    }).catch((notifyErr) => {
      console.error("[createAdminEvent] notify", notifyErr);
    });
  }

  return { ok: true, eventId: event.id, slug, coverWarning };
}
