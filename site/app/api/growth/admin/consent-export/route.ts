import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rows = await prisma.creatorArenaProfile.findMany({
    where: { consentGiven: true },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { consentGivenAt: "desc" },
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: session.user.id,
      action: "CREATOR_CONSENT_EXPORT",
      entity: "CreatorArenaProfile",
      metadata: { count: rows.length, timestamp: new Date().toISOString() },
    },
  });

  const header = ["الاسم", "البريد", "تاريخ الموافقة", "الإصدار", "عنوان IP", "إقرار التأهيل"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        csvEscape(r.user.name ?? ""),
        csvEscape(r.user.email),
        csvEscape(r.consentGivenAt?.toISOString() ?? ""),
        csvEscape(r.consentVersion ?? ""),
        csvEscape(r.consentIpAddress ?? ""),
        csvEscape(r.qualificationDetails ?? ""),
      ].join(","),
    ),
  ];

  const date = new Date().toISOString().slice(0, 10);
  // UTF-8 BOM so Excel on Windows detects Arabic/UTF-8 columns correctly.
  const csv = `\uFEFF${lines.join("\r\n")}`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="creator-consents-${date}.csv"`,
    },
  });
}
