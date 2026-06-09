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

  const rows = await prisma.creatorConsentLedger.findMany({
    orderBy: { recordedAt: "desc" },
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: session.user.id,
      action: "CREATOR_CONSENT_EXPORT",
      entity: "CreatorConsentLedger",
      metadata: { count: rows.length, timestamp: new Date().toISOString() },
    },
  });

  const header = [
    "record_id",
    "signer_name",
    "signer_email",
    "recorded_at_utc",
    "consent_version",
    "consent_locale",
    "consent_method",
    "consent_text_hash_sha256",
    "ip_address",
    "user_agent",
    "qualification_statement",
    "attestations_json",
    "previous_record_id",
  ];

  const lines = [
    header.join(","),
    ...rows.map((r: (typeof rows)[number]) =>
      [
        csvEscape(r.id),
        csvEscape(r.signerName),
        csvEscape(r.signerEmail),
        csvEscape(r.recordedAt.toISOString()),
        csvEscape(r.consentVersion),
        csvEscape(r.consentLocale),
        csvEscape(r.consentMethod),
        csvEscape(r.consentTextHash),
        csvEscape(r.ipAddress ?? ""),
        csvEscape(r.userAgent ?? ""),
        csvEscape(r.qualificationStatement),
        csvEscape(JSON.stringify(r.attestations)),
        csvEscape(r.previousRecordId ?? ""),
      ].join(","),
    ),
  ];

  const date = new Date().toISOString().slice(0, 10);
  const csv = `\uFEFF${lines.join("\r\n")}`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="creator-consent-ledger-${date}.csv"`,
    },
  });
}
