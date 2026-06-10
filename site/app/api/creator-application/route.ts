import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CREATOR_CONSENT_VERSION } from "@/lib/growth/creator-consent";
import { normalizePlatformUrl } from "@/lib/growth/normalize-platform-url";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  mainPlatformUrl: z
    .string()
    .trim()
    .transform(normalizePlatformUrl)
    .pipe(z.string().url()),
  platform: z.enum(["youtube", "instagram", "tiktok", "x", "facebook", "other"]).optional(),
  contentTypes: z.array(z.string()).min(1).max(10),
  followersRange: z.string().max(32),
  applicantNote: z.string().max(200).optional(),
  applicationConsentGiven: z.literal(true),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";
  const now = new Date();

  try {
    const row = await prisma.creatorApplication.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        mainPlatformUrl: parsed.data.mainPlatformUrl,
        platform: parsed.data.platform ?? null,
        contentTypes: parsed.data.contentTypes,
        followersRange: parsed.data.followersRange,
        applicantNote: parsed.data.applicantNote ?? null,
        applicationConsentGiven: true,
        applicationConsentAt: now,
        applicationConsentVersion: CREATOR_CONSENT_VERSION,
        applicationConsentIp: ip,
      },
    });

    return NextResponse.json({ ok: true, id: row.id });
  } catch (err) {
    console.error("[creator-application]", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
