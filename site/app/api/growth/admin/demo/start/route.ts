import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { buildCinematicDemoTimeline, pickDemoVariant } from "@/lib/demo/cinematic-demo-script";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  locale: z.string().min(2).max(12).optional(),
  variant: z.enum(["alpha", "beta", "gamma"]).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let locale: string | undefined;
  let variant: string | undefined;
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    locale = parsed.data.locale;
    variant = parsed.data.variant;
  } catch {
    locale = undefined;
    variant = undefined;
  }

  const v = pickDemoVariant(variant);
  const timeline = buildCinematicDemoTimeline(locale, v);

  const row = await prisma.demoSession.create({
    data: { createdById: session.user.id, scriptVariant: v },
  });

  await prisma.demoEvent.createMany({
    data: timeline.map((e) => ({
      sessionId: row.id,
      seq: e.seq,
      kind: e.kind,
      delayMs: e.delayMs,
      payload: e.payload as Prisma.InputJsonValue,
    })),
  });

  const events = await prisma.demoEvent.findMany({
    where: { sessionId: row.id },
    orderBy: { seq: "asc" },
  });

  return NextResponse.json({
    sessionId: row.id,
    variant: v,
    events: events.map((e) => ({
      id: e.id,
      seq: e.seq,
      kind: e.kind,
      delayMs: e.delayMs,
      payload: e.payload as Record<string, unknown>,
    })),
  });
}
