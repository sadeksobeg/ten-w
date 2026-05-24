import { EventContactStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type EventContactLeadRow = {
  id: string;
  name: string;
  handle: string | null;
  status: EventContactStatus;
  isManual: boolean;
  sourcePostId: string | null;
};

export type ExtractedContact = {
  name: string;
  handle: string | null;
  status: EventContactStatus;
  sourcePostId: string;
};

const CONTACTED_RE =
  /تم\s*(?:ال)?تواصل|تواصل(?:ت|نا|وا)?\s*(?:مع)?|رد(?:ت|)?(?: علينا)?|أجاب(?:ت|)?|تواصلوا|تم\s*الرد/i;
const PENDING_RE =
  /لم\s*(?:يتم|يرد|ترد)|ما\s*رد|لم\s*ترد|بانتظار|لم\s*أتواصل|no\s*reply/i;

function normalizeKey(name: string, handle: string | null): string {
  const raw = (handle ?? name).toLowerCase().replace(/^@/, "").trim();
  const slug = raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return slug || name.trim().toLowerCase();
}

function lineStatus(line: string): EventContactStatus | null {
  if (CONTACTED_RE.test(line)) return EventContactStatus.CONTACTED;
  if (PENDING_RE.test(line)) return EventContactStatus.PENDING;
  return null;
}

function cleanName(raw: string): string | null {
  let s = raw
    .replace(/^[\s\-–—•*]+/, "")
    .replace(/^(?:د\.|Dr\.?|doctor)\s*/i, "")
    .trim();
  s = s.split(/\(|@|–|—|-\s*(?=[a-zA-Z@])/)[0]?.trim() ?? s;
  s = s.replace(/\s{2,}/g, " ").trim();
  if (s.length < 3 || s.length > 80) return null;
  if (/^(?:مع|من|في|على|the|and|or)\b/i.test(s)) return null;
  if (/^\d+$/.test(s)) return null;
  return s;
}

function extractFromLine(line: string, postId: string): ExtractedContact[] {
  const out: ExtractedContact[] = [];
  const status = lineStatus(line) ?? EventContactStatus.PENDING;

  const handleMatch = line.match(/\(([a-zA-Z0-9_.]+)\)|@([a-zA-Z0-9_.]+)/);
  const handle = handleMatch ? (handleMatch[1] ?? handleMatch[2] ?? null) : null;

  const numbered = line.replace(/^[\s\d٠-٩]+[\-\.\)]\s*/, "").trim();
  const namePart = numbered.split(/[(@]/)[0]?.trim() ?? numbered;
  const name = cleanName(namePart);
  if (name) {
    out.push({ name, handle, status, sourcePostId: postId });
  }

  const withMatch = line.match(
    /(?:مع|with)\s+([^\n،,.;]+?)(?:\s+و|\s+and|$|[،,.;])/i,
  );
  if (withMatch?.[1]) {
    for (const chunk of withMatch[1].split(/\s+و\s+|\s+and\s+/i)) {
      const n = cleanName(chunk);
      if (n) out.push({ name: n, handle: null, status, sourcePostId: postId });
    }
  }

  return out;
}

export function extractContactsFromPosts(
  posts: { id: string; body: string }[],
): ExtractedContact[] {
  const map = new Map<string, ExtractedContact>();

  for (const post of posts) {
    const lines = post.body.split(/\n+/);
    for (const line of lines) {
      if (line.trim().length < 4) continue;
      for (const c of extractFromLine(line, post.id)) {
        const key = normalizeKey(c.name, c.handle);
        const prev = map.get(key);
        if (!prev) {
          map.set(key, c);
        } else if (
          c.status === EventContactStatus.CONTACTED &&
          prev.status === EventContactStatus.PENDING
        ) {
          map.set(key, { ...prev, status: EventContactStatus.CONTACTED, sourcePostId: post.id });
        }
      }
    }

    if (CONTACTED_RE.test(post.body)) {
      for (const c of map.values()) {
        if (post.body.includes(c.name)) {
          const key = normalizeKey(c.name, c.handle);
          const cur = map.get(key);
          if (cur) {
            map.set(key, { ...cur, status: EventContactStatus.CONTACTED, sourcePostId: post.id });
          }
        }
      }
    }
  }

  return [...map.values()];
}

export async function syncEventContactLeads(
  eventId: string,
  posts: { id: string; body: string }[],
): Promise<EventContactLeadRow[]> {
  const extracted = extractContactsFromPosts(posts);

  for (const c of extracted) {
    const normalizedKey = normalizeKey(c.name, c.handle);
    const existing = await prisma.eventContactLead.findUnique({
      where: { eventId_normalizedKey: { eventId, normalizedKey } },
    });

    if (!existing) {
      await prisma.eventContactLead.create({
        data: {
          eventId,
          normalizedKey,
          name: c.name,
          handle: c.handle,
          status: c.status,
          sourcePostId: c.sourcePostId,
          isManual: false,
        },
      });
      continue;
    }

    if (existing.isManual) continue;

    const nextStatus =
      c.status === EventContactStatus.CONTACTED ||
      existing.status === EventContactStatus.CONTACTED
        ? EventContactStatus.CONTACTED
        : EventContactStatus.PENDING;

    if (nextStatus !== existing.status || existing.name !== c.name) {
      await prisma.eventContactLead.update({
        where: { id: existing.id },
        data: {
          status: nextStatus,
          name: existing.isManual ? existing.name : c.name,
          handle: existing.handle ?? c.handle,
          sourcePostId: c.sourcePostId,
        },
      });
    }
  }

  return listEventContactLeads(eventId);
}

export async function listEventContactLeads(eventId: string): Promise<EventContactLeadRow[]> {
  const rows = await prisma.eventContactLead.findMany({
    where: { eventId },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    handle: r.handle,
    status: r.status,
    isManual: r.isManual,
    sourcePostId: r.sourcePostId,
  }));
}
