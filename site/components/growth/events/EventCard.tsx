import Link from "next/link";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";

export type EventCardData = {
  slug: string;
  title: string;
  description: string;
  coverImage?: string | null;
  status: string;
  statusLabel?: string;
  startAt: string;
  endAt?: string | null;
  participantCount: number;
  milestoneCount: number;
  totalXp: number;
  progress?: number;
  joined?: boolean;
  completed?: boolean;
  locale: string;
};

type Props = {
  event: EventCardData;
  joinLabel: string;
  progressLabel?: string;
  viewLabel: string;
};

export function EventCard({ event, joinLabel, progressLabel, viewLabel }: Props) {
  const href = `/${event.locale}/growth/events/${event.slug}`;
  const desc =
    event.description.length > 120
      ? `${event.description.slice(0, 120)}…`
      : event.description;

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="relative aspect-video w-full bg-black/40">
        {event.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.coverImage} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#1A1A24] to-[#534AB7]/30 text-4xl opacity-40">
            🎯
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <span
          className={`absolute start-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
            event.status === "ACTIVE"
              ? "bg-emerald-500/30 text-emerald-200"
              : event.status === "PUBLISHED"
                ? "bg-gold/30 text-gold"
                : "bg-black/50 text-white/70"
          }`}
        >
          {event.statusLabel ?? event.status}
        </span>
        <span className="absolute end-3 top-3 text-[10px] text-white/70">
          {new Date(event.startAt).toLocaleDateString()}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold">{event.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-[var(--growth-text-sub)]">{desc}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--growth-text-sub)]">
          <span>👥 {event.participantCount}</span>
          <span>🏆 {event.milestoneCount}</span>
          <span>⚡ {event.totalXp} XP</span>
        </div>
        {event.joined && typeof event.progress === "number" ? (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[10px]">
              <span>{progressLabel}</span>
              <span>{event.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gold/80"
                style={{ width: `${event.progress}%` }}
              />
            </div>
          </div>
        ) : null}
        <div className="mt-4">
          <Link href={href}>
            <GoldButton className="w-full sm:w-auto">
              {event.completed ? viewLabel : event.joined ? progressLabel ?? viewLabel : joinLabel}
            </GoldButton>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
