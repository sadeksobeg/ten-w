import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  sessionId: z.string().min(1),
  status: z.enum(["COMPLETED", "ABORTED"]).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const nextStatus = body.status === "ABORTED" ? ("ABORTED" as const) : ("COMPLETED" as const);

  const updated = await prisma.demoSession.updateMany({
    where: { id: body.sessionId, createdById: session.user.id },
    data: { status: nextStatus, endedAt: new Date() },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
