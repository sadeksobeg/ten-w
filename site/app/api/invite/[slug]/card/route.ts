import { NextResponse } from "next/server";
import { findInviteCardRow } from "@/lib/invite/get-card";
import { renderLuxuryInviteCardPng } from "@/lib/invite/render-luxury-card-png";
import { requireInviteAdmin } from "@/lib/invite/require-admin";
import { getSiteUrl } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const admin = await requireInviteAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const card = await findInviteCardRow(slug);
  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const inviteUrl = `${getSiteUrl().origin}/invite/${card.slug}`;
  const png = await renderLuxuryInviteCardPng({
    name: card.name,
    handle: card.handle,
    tier: card.tier,
    scope: card.scope,
    token: card.token,
    inviteUrl,
    message: card.message,
  });

  const safeName = card.name.replace(/[^\w\u0600-\u06FF.-]+/g, "-").slice(0, 40);
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="tenegta-invite-${safeName}.png"`,
      "Cache-Control": "private, no-store",
    },
  });
}
