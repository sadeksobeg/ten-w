import { NextResponse } from "next/server";
import { resolvePartnerFromCreatorSlug } from "@/lib/growth/resolve-order-partner";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim() ?? "";
  if (!slug) {
    return NextResponse.json({ ok: false, error: "missing_slug" });
  }

  const partner = await resolvePartnerFromCreatorSlug(slug);
  if (!partner) {
    return NextResponse.json({ ok: false, error: "invalid_slug" });
  }

  return NextResponse.json({
    ok: true,
    code: partner.discountCode,
    discountBps: partner.discountBps,
    creatorName: partner.name,
  });
}
