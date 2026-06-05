import { randomBytes } from "crypto";
import { z } from "zod";

export const INVITE_TIERS = [
  "CONTENT CREATOR",
  "CREATIVE PARTNER",
  "BRAND AMBASSADOR",
] as const;

export type InviteTier = (typeof INVITE_TIERS)[number];

export const createInviteSchema = z.object({
  name: z.string().trim().min(2).max(120),
  handle: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-zA-Z0-9._-]+$/, "Handle must be alphanumeric with . _ -"),
  tier: z.enum(INVITE_TIERS).default("CONTENT CREATOR"),
  scope: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(2000),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;

function slugPart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function generateToken(name: string): string {
  const part = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase()
    .slice(0, 12) || "GUEST";
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `TNGTA-${part}-${suffix}`;
}

export function generateSlugBase(name: string, handle: string): string {
  const n = slugPart(name) || "creator";
  const h = slugPart(handle.replace(/^@/, "")) || "user";
  return `${n}-${h}`.slice(0, 80);
}

export function generateSlugSuffix(): string {
  return randomBytes(2).toString("hex");
}
