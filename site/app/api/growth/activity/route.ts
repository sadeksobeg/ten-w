import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchActivityEventsSafe } from "@/lib/growth/prisma-optional";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "PARTNER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const rows = await fetchActivityEventsSafe(prisma, 20);

  return NextResponse.json({
    items: rows.map((r) => ({
      id: r.id,
      headline: r.headline,
      amountCents: r.amountCents,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
