import { NextResponse } from "next/server";
import { getShareCardProfileBySlug } from "@/lib/growth/get-share-card-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(req: Request, ctx: RouteContext) {
  try {
    const { slug } = await ctx.params;
    const url = new URL(req.url);
    const locale = url.searchParams.get("locale") ?? "ar";
    const host = url.searchParams.get("host") ?? url.host ?? "tenegta.com";

    const data = await getShareCardProfileBySlug(slug, locale);
    if (!data) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const profileUrl = `https://${host}/${locale}/growth/profile/${data.publicSlug}?ref=${encodeURIComponent(data.referralCode)}`;

    return NextResponse.json({
      ...data,
      locale,
      profileUrl,
    });
  } catch (err) {
    console.error("[share-data]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
