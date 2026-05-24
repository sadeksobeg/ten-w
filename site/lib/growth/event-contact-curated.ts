import { EventContactStatus } from "@prisma/client";

export type CuratedContactLead = {
  name: string;
  handle: string | null;
  status: EventContactStatus;
};

/** Canonical list extracted from the team outreach post. */
export const CURATED_EVENT_CONTACT_LEADS: CuratedContactLead[] = [
  { name: "دلع حسون", handle: null, status: EventContactStatus.CONTACTED },
  { name: "دعاء حمود", handle: null, status: EventContactStatus.CONTACTED },
  { name: "كريم حسن", handle: null, status: EventContactStatus.CONTACTED },
  { name: "وسيم قداحة", handle: null, status: EventContactStatus.CONTACTED },
  { name: "ميسم حيدر", handle: null, status: EventContactStatus.CONTACTED },
  { name: "مايا جبر", handle: null, status: EventContactStatus.CONTACTED },
  { name: "بتول منصور", handle: null, status: EventContactStatus.PENDING },
  { name: "ديما دالاتي", handle: null, status: EventContactStatus.PENDING },
  { name: "يارا الشيخ", handle: null, status: EventContactStatus.PENDING },
  { name: "ڤيوليت رستم", handle: null, status: EventContactStatus.PENDING },
  { name: "رهف سلوم", handle: "dr_rahaf_brand", status: EventContactStatus.PENDING },
  { name: "رغد سلوم", handle: "drhero_products", status: EventContactStatus.PENDING },
  { name: "لونا ابراهيم", handle: "luna_albr", status: EventContactStatus.PENDING },
  { name: "بتول رستم", handle: "batoul_rstomm", status: EventContactStatus.PENDING },
];
