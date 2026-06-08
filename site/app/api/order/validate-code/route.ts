import { NextResponse } from "next/server";
import { resolvePartnerFromDiscountCode } from "@/lib/growth/resolve-order-partner";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code")?.trim() ?? "";
  if (!code) {
    return NextResponse.json({ ok: false, error: "missing_code" });
  }

  const partner = await resolvePartnerFromDiscountCode(code);
  if (!partner) {
    return NextResponse.json({ ok: false, error: "invalid_code" });
  }

  return NextResponse.json({
    ok: true,
    discountBps: partner.discountBps,
    creatorName: partner.name,
  });
}
