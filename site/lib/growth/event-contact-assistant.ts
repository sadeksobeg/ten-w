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

const TITLE_PREFIX =
  /^(?:المؤثرة|المؤثر|الاعلامي|الإعلامي|صانعة\s+المحتوى|الصبية|الدكتورة|د\.|Dr\.?)\s+/gi;

const HANDLE_RE = /^@?([a-z][a-z0-9_.]{2,})$/i;

function normalizeKey(name: string, handle: string | null): string {
  const raw = (handle ?? name).toLowerCase().replace(/^@/, "").trim();
  const slug = raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return slug || name.trim().toLowerCase();
}

function stripTitles(raw: string): string {
  return raw.replace(TITLE_PREFIX, "").trim();
}

function stripTrailingNoise(raw: string): string {
  return raw
    .replace(/\s+من\s+(?:محافظة\s+)?[^\n،,.]+$/i, "")
    .replace(/\s+ساكن(?:ة)?\s+(?:ب(?:ال)?|في)?[^\n،,.]+$/i, "")
    .replace(/\s+عندها\s+\d[\d٠-٩,\s]*(?:متابع|ف)?[^\n]*$/i, "")
    .replace(/\s+وغالباً.*/i, "")
    .replace(/\s+له(?:لا|ل)\s+.*/i, "")
    .replace(/\s+(?:بس|لكن)\s+.*/i, "")
    .replace(/\s+وال(?:مسا|انا).*/i, "")
    .trim();
}

function cleanName(raw: string): string | null {
  let s = stripTitles(stripTrailingNoise(raw))
    .replace(/^[\s\-–—•*]+/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  s = s.replace(/@?[a-z][a-z0-9_.]+\s*$/i, "").trim();
  if (s.length < 2 || s.length > 80) return null;
  if (/^(?:مع|من|في|على|the|and|or|مساء|تم|موفقين|حبيت|اقترح|انت|انا)\b/i.test(s)) return null;
  if (/^\d+$/.test(s)) return null;
  if (/^(?:الكل|جميعا|نشالله|بشغلكم|بهاد|الايفنت)/i.test(s)) return null;
  return s;
}

function lineStatus(line: string): EventContactStatus {
  if (/م(?:ا|ات)\s*تم\s*(?:ال)?رد|لم\s*(?:يتم|يرد|ترد)|ما\s*رد|ناطر(?:تا|ه)|ت(?:أ|ا)كد\s+من|بانتظار/i.test(line)) {
    return EventContactStatus.PENDING;
  }
  if (/(?:ات)?(?:واصلت|أتواصلت)|تم\s*التواصل|تواصلوا/i.test(line)) {
    return EventContactStatus.CONTACTED;
  }
  return EventContactStatus.PENDING;
}

function parseNameChunks(segment: string, status: EventContactStatus, postId: string): ExtractedContact[] {
  const out: ExtractedContact[] = [];
  const chunks = segment.split(/\s+و\s+/);

  for (const chunk of chunks) {
    const handleInline = chunk.match(/@?([a-z][a-z0-9_.]+)/i);
    const handle = handleInline?.[1] ?? null;
    const name = cleanName(chunk);
    if (name) out.push({ name, handle, status, sourcePostId: postId });
  }
  return out;
}

function extractFromLine(line: string, postId: string): ExtractedContact[] {
  const trimmed = line.trim();
  if (trimmed.length < 4) return [];

  const status = lineStatus(trimmed);
  const out: ExtractedContact[] = [];

  const contactMatch = trimmed.match(
    /(?:تم\s*التواصل\s+مع|(?:ات|أ)?(?:واصلت|أتواصلت|تواصلت)\s+مع|انا\s+تواصلت\s+مع)\s*(.+)/i,
  );
  if (contactMatch?.[1]) {
    out.push(...parseNameChunks(contactMatch[1], status, postId));
  }

  const listMatch = trimmed.match(
    /^(?:أ?ولا|ثانيا|ثالث|رابع|خامس|سادس)[ً:]?\s*(?:الدكتورة|د\.)?\s*(.+)/i,
  );
  if (listMatch?.[1]) {
    const chunk = listMatch[1].split(/[،,.]/)[0] ?? listMatch[1];
    const name = cleanName(chunk);
    if (name) out.push({ name, handle: null, status: EventContactStatus.PENDING, sourcePostId: postId });
  }

  const numbered = trimmed.match(/^[\s\d٠-٩]+[\-\.\)]\s*(.+)/);
  if (numbered?.[1]) {
    const name = cleanName(numbered[1]);
    if (name) out.push({ name, handle: null, status, sourcePostId: postId });
  }

  return out;
}

export function extractContactsFromPosts(
  posts: { id: string; body: string }[],
): ExtractedContact[] {
  const map = new Map<string, ExtractedContact>();
  let lastKey: string | null = null;

  const upsert = (c: ExtractedContact) => {
    const key = normalizeKey(c.name, c.handle);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, c);
      lastKey = key;
      return;
    }
    if (c.status === EventContactStatus.CONTACTED && prev.status === EventContactStatus.PENDING) {
      map.set(key, { ...prev, status: EventContactStatus.CONTACTED, sourcePostId: c.sourcePostId });
    }
    if (!prev.handle && c.handle) {
      map.set(key, { ...prev, handle: c.handle });
    }
    lastKey = key;
  };

  for (const post of posts) {
    lastKey = null;
    const lines = post.body.split(/\n+/);

    for (const line of lines) {
      const handleOnly = line.trim().match(HANDLE_RE);
      if (handleOnly && lastKey && map.has(lastKey)) {
        const cur = map.get(lastKey)!;
        if (!cur.handle) {
          map.set(lastKey, { ...cur, handle: handleOnly[1] });
        }
        continue;
      }

      for (const c of extractFromLine(line, post.id)) {
        upsert(c);
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

    await prisma.eventContactLead.update({
      where: { id: existing.id },
      data: {
        status: nextStatus,
        name: c.name,
        handle: existing.handle ?? c.handle,
        sourcePostId: c.sourcePostId,
      },
    });
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

export async function adminUpsertManualLead(input: {
  eventId: string;
  name: string;
  handle?: string | null;
  status: EventContactStatus;
  leadId?: string;
}): Promise<EventContactLeadRow> {
  const name = input.name.trim();
  const handle = input.handle?.trim().replace(/^@/, "") || null;
  const normalizedKey = normalizeKey(name, handle);

  if (input.leadId) {
    const row = await prisma.eventContactLead.update({
      where: { id: input.leadId },
      data: { name, handle, status: input.status, isManual: true },
    });
    return {
      id: row.id,
      name: row.name,
      handle: row.handle,
      status: row.status,
      isManual: row.isManual,
      sourcePostId: row.sourcePostId,
    };
  }

  const row = await prisma.eventContactLead.upsert({
    where: { eventId_normalizedKey: { eventId: input.eventId, normalizedKey } },
    create: {
      eventId: input.eventId,
      normalizedKey,
      name,
      handle,
      status: input.status,
      isManual: true,
    },
    update: { name, handle, status: input.status, isManual: true },
  });

  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    status: row.status,
    isManual: row.isManual,
    sourcePostId: row.sourcePostId,
  };
}
