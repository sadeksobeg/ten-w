import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  mainPlatformUrl: z.string().url(),
  platform: z.enum(["youtube", "instagram", "tiktok", "x", "facebook", "other"]).optional(),
  contentTypes: z.array(z.string()).default([]),
  followersRange: z.string().max(32),
  applicantNote: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const row = await prisma.creatorApplication.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      mainPlatformUrl: parsed.data.mainPlatformUrl,
      platform: parsed.data.platform ?? null,
      contentTypes: parsed.data.contentTypes,
      followersRange: parsed.data.followersRange,
      applicantNote: parsed.data.applicantNote ?? null,
    },
  });

  return NextResponse.json({ ok: true, id: row.id });
}
