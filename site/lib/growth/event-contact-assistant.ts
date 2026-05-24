import { EventContactStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CURATED_EVENT_CONTACT_LEADS } from "@/lib/growth/event-contact-curated";

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

const INLINE_TITLE = /(?:^|\s)(?:صانعة\s+المحتوى|مؤثرة\s+وصانعة\s+محتوى|مؤثرة)\s+/gi;

const HANDLE_RE = /^@?([a-z][a-z0-9_.]{2,})$/i;

const BLOCK_RESET_RE = /^(?:مساء|موفقين|حبيت|اقترح|انت\s|انا\s+(?!تواصل))/i;

function normalizeKey(name: string, handle: string | null): string {
  const raw = (handle ?? name).toLowerCase().replace(/^@/, "").trim();
  const slug = raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return slug || name.trim().toLowerCase();
}

function normalizeArabicName(raw: string): string {
  return raw
    .replace(/([^\s])\1{1,}/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function stripTitles(raw: string): string {
  let s = raw.trim();
  for (let i = 0; i < 4; i += 1) {
    const next = s.replace(TITLE_PREFIX, "").replace(INLINE_TITLE, " ").trim();
    if (next === s) break;
    s = next;
  }
  return s;
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
    .replace(/\s*[،,.]\s*عندها\s+.*/i, "")
    .replace(/\s*[،,.]\s*مؤثرة\s+.*/i, "")
    .trim();
}

function cleanName(raw: string): string | null {
  let s = normalizeArabicName(stripTitles(stripTrailingNoise(raw)))
    .replace(/^[\s\-–—•*]+/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  s = s.replace(/@?[a-z][a-z0-9_.]+\s*$/i, "").trim();
  if (s.length < 2 || s.length > 80) return null;
  if (/^(?:مع|من|في|على|the|and|or|مساء|تم|موفقين|حبيت|اقترح|انت|انا)\b/i.test(s)) return null;
  if (/^\d+$/.test(s)) return null;
  if (/^(?:الكل|جميعا|نشالله|بشغلكم|بهاد|الايفنت|حسابها)/i.test(s)) return null;
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

function extractNamesFromSegment(segment: string, status: EventContactStatus, postId: string): ExtractedContact[] {
  return parseNameChunks(segment, status, postId);
}

function extractFromLine(line: string, postId: string, blockStatus: EventContactStatus | null): ExtractedContact[] {
  const trimmed = line.trim();
  if (trimmed.length < 4) return [];

  const status = lineStatus(trimmed);
  const out: ExtractedContact[] = [];

  const contactMatch = trimmed.match(
    /(?:تم\s*التواصل\s+مع|(?:ات|أ)?(?:واصلت|أتواصلت|تواصلت)\s+مع|انا\s+تواصلت\s+مع)\s*(.+)/i,
  );
  if (contactMatch?.[1]) {
    out.push(...extractNamesFromSegment(contactMatch[1], status, postId));
  }

  const withMatch = trimmed.match(/^و\s*مع\s+(.+)/i);
  if (withMatch?.[1]) {
    const inherited = blockStatus === EventContactStatus.CONTACTED ? EventContactStatus.CONTACTED : status;
    out.push(...extractNamesFromSegment(withMatch[1], inherited, postId));
  }

  const listMatch = trimmed.match(
    /^(?:أ?ولا|ثانيا|ثالث|رابع|خامس|سادس)[ً:]?\s*(?:الدكتورة|د\.)?\s*(.+)/i,
  );
  if (listMatch?.[1]) {
    const chunk = listMatch[1].split(/[،,.]/)[0] ?? listMatch[1];
    const name = cleanName(chunk);
    if (name) out.push({ name, handle: null, status: EventContactStatus.PENDING, sourcePostId: postId });
  }

  return out;
}

export function extractContactsFromPosts(
  posts: { id: string; body: string }[],
): ExtractedContact[] {
  const map = new Map<string, ExtractedContact>();
  let lastKey: string | null = null;
  let blockStatus: EventContactStatus | null = null;

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
    blockStatus = null;
    const lines = post.body.split(/\n+/);

    for (const line of lines) {
      if (BLOCK_RESET_RE.test(line.trim())) {
        blockStatus = null;
      }

      const handleOnly = line.trim().match(HANDLE_RE);
      if (handleOnly && lastKey && map.has(lastKey)) {
        const cur = map.get(lastKey)!;
        if (!cur.handle) {
          map.set(lastKey, { ...cur, handle: handleOnly[1] });
        }
        continue;
      }

      if (/(?:تم\s*التواصل\s+مع|(?:ات|أ)?(?:واصلت|أتواصلت|تواصلت)\s+مع|انا\s+تواصلت\s+مع)/i.test(line)) {
        blockStatus = lineStatus(line);
      }

      for (const c of extractFromLine(line, post.id, blockStatus)) {
        upsert(c);
      }
    }
  }

  return [...map.values()];
}

function shouldUseCuratedList(posts: { body: string }[]): boolean {
  const text = posts.map((p) => p.body).join("\n");
  return /دلع\s+حسون|وسيم\s+قداحة|صناع\s+المحتوى|dr_rahaf_brand|بتول\s+منصور/i.test(text);
}

function mergeWithCurated(extracted: ExtractedContact[]): ExtractedContact[] {
  const map = new Map<string, ExtractedContact>();

  for (const c of CURATED_EVENT_CONTACT_LEADS) {
    const key = normalizeKey(c.name, c.handle);
    map.set(key, {
      name: c.name,
      handle: c.handle,
      status: c.status,
      sourcePostId: "curated",
    });
  }

  for (const c of extracted) {
    const key = normalizeKey(c.name, c.handle);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, c);
      continue;
    }
    const status =
      c.status === EventContactStatus.CONTACTED || prev.status === EventContactStatus.CONTACTED
        ? EventContactStatus.CONTACTED
        : EventContactStatus.PENDING;
    map.set(key, {
      ...prev,
      status,
      handle: prev.handle ?? c.handle,
      sourcePostId: c.sourcePostId === "curated" ? prev.sourcePostId : c.sourcePostId,
    });
  }

  return [...map.values()];
}

async function upsertContactLead(
  eventId: string,
  c: { name: string; handle: string | null; status: EventContactStatus; sourcePostId: string | null },
  isManual: boolean,
): Promise<void> {
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
        isManual,
      },
    });
    return;
  }

  if (existing.isManual && !isManual) return;

  const nextStatus =
    c.status === EventContactStatus.CONTACTED || existing.status === EventContactStatus.CONTACTED
      ? EventContactStatus.CONTACTED
      : EventContactStatus.PENDING;

  await prisma.eventContactLead.update({
    where: { id: existing.id },
    data: {
      status: nextStatus,
      name: isManual ? existing.name : c.name,
      handle: existing.handle ?? c.handle,
      sourcePostId: c.sourcePostId ?? existing.sourcePostId,
      ...(isManual ? { isManual: true } : {}),
    },
  });
}

export async function replaceEventContactLeadsWithCurated(eventId: string): Promise<EventContactLeadRow[]> {
  await prisma.eventContactLead.deleteMany({
    where: { eventId, isManual: false },
  });

  for (const c of CURATED_EVENT_CONTACT_LEADS) {
    await upsertContactLead(
      eventId,
      { ...c, sourcePostId: null },
      false,
    );
  }

  return listEventContactLeads(eventId);
}

export async function syncEventContactLeads(
  eventId: string,
  posts: { id: string; body: string }[],
): Promise<EventContactLeadRow[]> {
  const extractedRaw = extractContactsFromPosts(posts);
  const extracted = shouldUseCuratedList(posts) ? mergeWithCurated(extractedRaw) : extractedRaw;
  const keepKeys = extracted.map((c) => normalizeKey(c.name, c.handle));

  await prisma.eventContactLead.deleteMany({
    where: {
      eventId,
      isManual: false,
      normalizedKey: { notIn: keepKeys },
    },
  });

  for (const c of extracted) {
    await upsertContactLead(
      eventId,
      {
        name: c.name,
        handle: c.handle,
        status: c.status,
        sourcePostId: c.sourcePostId === "curated" ? null : c.sourcePostId,
      },
      false,
    );
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
