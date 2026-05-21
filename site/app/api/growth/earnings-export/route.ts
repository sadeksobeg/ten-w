import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PARTNER") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rows = await prisma.commissionLedger.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      createdAt: true,
      tier: true,
      amountCents: true,
      dealId: true,
    },
  });

  const lines = [
    "date,tier,amount_usd,deal_id",
    ...rows.map((r) => {
      const d = r.createdAt.toISOString().slice(0, 10);
      const usd = (r.amountCents / 100).toFixed(2);
      return `${d},${r.tier},${usd},${r.dealId ?? ""}`;
    }),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="tenegta-earnings.csv"',
    },
  });
}
