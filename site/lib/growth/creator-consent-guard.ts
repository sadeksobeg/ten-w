import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CREATOR_CONSENT_VERSION } from "@/lib/growth/creator-consent";

export async function getRequestClientMeta(): Promise<{ ip: string; userAgent: string }> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";
  const userAgent = h.get("user-agent") ?? "unknown";
  return { ip, userAgent };
}

export async function requireCreatorConsent(userId: string): Promise<void> {
  const profile = await prisma.creatorArenaProfile.findUnique({
    where: { userId },
    select: { consentGiven: true, consentVersion: true },
  });
  if (!profile?.consentGiven || profile.consentVersion !== CREATOR_CONSENT_VERSION) {
    throw new Error("CONSENT_REQUIRED");
  }
}

export function isConsentRequiredError(err: unknown): boolean {
  return err instanceof Error && err.message === "CONSENT_REQUIRED";
}
