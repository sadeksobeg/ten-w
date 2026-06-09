import { NextRequest, NextResponse } from "next/server";
import { loadCreatorHubDeferred, requireCreatorHubSession } from "@/lib/growth/creator-hub-loader";

export async function GET(req: NextRequest) {
  const gate = await requireCreatorHubSession();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.reason }, { status: gate.reason === "unauthorized" ? 401 : 403 });
  }

  const raw = req.nextUrl.searchParams.get("locale");
  const locale = raw === "en" || raw === "fr" ? raw : "ar";
  try {
    const data = await loadCreatorHubDeferred(gate.userId, locale);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    console.error("[creator-hub-deferred]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
