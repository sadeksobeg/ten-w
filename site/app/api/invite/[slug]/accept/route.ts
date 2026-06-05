import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitInviteAccept } from "@/lib/invite/rate-limit-invite";

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: Params) {
  const limited = await rateLimitInviteAccept(req);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const { slug } = await params;
  const card = await prisma.inviteCard.findUnique({ where: { slug } });
  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (card.accepted) {
    return NextResponse.json({ ok: true, alreadyAccepted: true });
  }

  await prisma.inviteCard.update({
    where: { id: card.id },
    data: { accepted: true, acceptedAt: new Date() },
  });

  return NextResponse.json({ ok: true, alreadyAccepted: false });
}
