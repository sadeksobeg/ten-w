import { NextResponse } from "next/server";
import { getPublicProfileBySlug } from "@/lib/growth/get-public-profile";
import {
  generatePartnerShareCard,
  type ShareCardFormat,
} from "@/lib/growth/generate-partner-share-card";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(req: Request, ctx: RouteContext) {
  const { slug } = await ctx.params;
  const url = new URL(req.url);
  const formatRaw = url.searchParams.get("format");
  const format: ShareCardFormat =
    formatRaw === "story" ? "story" : "landscape";
  const locale = url.searchParams.get("locale") ?? "ar";

  const data = await getPublicProfileBySlug(slug, locale);
  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const host = url.searchParams.get("host") ?? "tenegta.com";
  const profileUrl = `https://${host}/${locale}/growth/profile/${data.publicSlug}?ref=${encodeURIComponent(data.referralCode)}`;

  const topBadges = data.earnedBadges
    .filter((b) => b.earned)
    .slice(0, 3)
    .map((b) => b.name);

  return generatePartnerShareCard({
    name: data.name,
    levelName: data.levelName,
    totalXp: data.totalXp,
    closedDeals: data.closedDeals,
    badgeCount: data.badgeCount,
    referralCode: data.referralCode,
    profileUrl,
    locale,
    topBadges,
    format,
  });
}
