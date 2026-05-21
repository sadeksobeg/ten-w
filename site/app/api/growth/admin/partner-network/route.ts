import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPartnerNetworkTree } from "@/lib/growth/partner-network";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "missing_userId" }, { status: 400 });
  }
  const locale = new URL(req.url).searchParams.get("locale") ?? "ar";
  const { tree, stats } = await getPartnerNetworkTree(userId, { locale });
  return NextResponse.json({ tree, stats });
}
