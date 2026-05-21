import { ImageResponse } from "next/og";

export type ShareCardFormat = "story" | "landscape";

const sizes: Record<ShareCardFormat, { width: number; height: number }> = {
  story: { width: 1080, height: 1080 },
  landscape: { width: 1200, height: 630 },
};

export type ShareCardInput = {
  name: string;
  levelName: string;
  totalXp: number;
  closedDeals: number;
  badgeCount: number;
  referralCode: string;
  profileUrl: string;
  locale?: string;
  topBadges?: string[];
  format?: ShareCardFormat;
};

export function generatePartnerShareCard(input: ShareCardInput) {
  const format = input.format ?? "landscape";
  const { width, height } = sizes[format];
  const isRtl = input.locale === "ar";
  const dir = isRtl ? "rtl" : "ltr";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(input.profileUrl)}`;
  const badges = (input.topBadges ?? []).slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: format === "story" ? 72 : 56,
          background:
            "linear-gradient(145deg, #0a0a0f 0%, #12121a 40%, #1a1510 70%, #0a0a0f 100%)",
          color: "#f0ede8",
          fontFamily: "system-ui, sans-serif",
          direction: dir,
          border: "4px solid rgba(176, 125, 43, 0.55)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "0.14em", color: "#e4b84d" }}>
            T.E.N.E.G.T.A
          </span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              padding: "8px 20px",
              borderRadius: 999,
              background: "rgba(176, 125, 43, 0.25)",
              color: "#e4b84d",
            }}
          >
            {input.levelName}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: format === "story" ? "column" : "row", gap: 40, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            <span style={{ fontSize: format === "story" ? 64 : 52, fontWeight: 800, lineHeight: 1.1 }}>
              {input.name}
            </span>
            <span style={{ fontSize: 28, color: "rgba(255,255,255,0.65)" }}>
              {input.totalXp} XP · {input.closedDeals}{" "}
              {isRtl ? "صفقة" : "deals"} · {input.badgeCount}{" "}
              {isRtl ? "شارة" : "badges"}
            </span>
            {badges.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {badges.map((b) => (
                  <span
                    key={b}
                    style={{
                      fontSize: 18,
                      padding: "6px 14px",
                      borderRadius: 8,
                      background: "rgba(83, 74, 183, 0.35)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    {b}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <img src={qrUrl} width={format === "story" ? 240 : 200} height={format === "story" ? 240 : 200} alt="" />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "2px solid rgba(176, 125, 43, 0.35)",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 18, color: "rgba(255,255,255,0.5)" }}>
              {isRtl ? "كود الإحالة" : "Referral code"}
            </span>
            <span style={{ fontSize: 40, fontWeight: 800, color: "#e4b84d", letterSpacing: "0.08em" }}>
              {input.referralCode}
            </span>
          </div>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 400 }}>
            {isRtl ? "انضم لشبكة النمو — امسح الرمز" : "Join the growth network — scan to start"}
          </span>
        </div>
      </div>
    ),
    { width, height },
  );
}
