import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import {
  createAdminEvent,
  type AdminCreateEventPayload,
} from "@/lib/growth/admin-create-event";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: AdminCreateEventPayload;
  try {
    body = (await req.json()) as AdminCreateEventPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const result = await createAdminEvent(body, session.user.id);
  const status = result.ok ? 200 : result.error === "unauthorized" ? 401 : 400;
  return NextResponse.json(result, { status });
}
