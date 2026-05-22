import { NextResponse } from "next/server";
import { getShareCardProfileBySlug } from "@/lib/growth/get-share-card-profile";
import {
  generatePartnerShareCard,
  type ShareCardFormat,
} from "@/lib/growth/generate-partner-share-card";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(req: Request, ctx: RouteContext) {
  try {
    const { slug } = await ctx.params;
    const url = new URL(req.url);
    const formatRaw = url.searchParams.get("format");
    const format: ShareCardFormat =
      formatRaw === "story" ? "story" : "landscape";
    const locale = url.searchParams.get("locale") ?? "ar";

    const data = await getShareCardProfileBySlug(slug, locale);
    if (!data) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const host = url.searchParams.get("host") ?? "tenegta.com";
    const profileUrl = `https://${host}/${locale}/growth/profile/${data.publicSlug}?ref=${encodeURIComponent(data.referralCode)}`;
    return generatePartnerShareCard({
      name: data.name,
      levelName: data.levelName,
      totalXp: data.totalXp,
      closedDeals: data.closedDeals,
      badgeCount: data.badgeCount,
      referralCode: data.referralCode,
      profileUrl,
      locale,
      topBadges: data.topBadges,
      format,
    });
  } catch (err) {
    console.error("[share-card]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
