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
  /** PNG data URL from server-side QR (no external fetch). */
  qrDataUrl?: string;
};

export function generatePartnerShareCard(input: ShareCardInput) {
  const format = input.format ?? "landscape";
  const { width, height } = sizes[format];
  const isRtl = input.locale === "ar";
  const dir = isRtl ? "rtl" : "ltr";
  const badges = (input.topBadges ?? []).slice(0, 3);
  const qrSize = format === "story" ? 240 : 200;

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
            "linear-gradient(145deg, #1a1208 0%, #0a0a0f 35%, #2a1f0a 65%, #0a0a0f 100%)",
          color: "#f0ede8",
          fontFamily: "system-ui, sans-serif",
          direction: dir,
          border: "4px solid rgba(176, 125, 43, 0.55)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "linear-gradient(135deg, #B07D2B 0%, #E4B84D 50%, #534AB7 100%)",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 900,
                color: "#0a0a0f",
                border: "2px solid rgba(228,184,77,0.7)",
                boxShadow: "0 0 24px rgba(228,184,77,0.35)",
              }}
            >
              T
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.12em", color: "#e4b84d" }}>
                T.E.N.E.G.T.A
              </span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", letterSpacing: "0.2em" }}>
                {isRtl ? "شريك معتمد" : "CERTIFIED PARTNER"}
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              padding: "8px 20px",
              borderRadius: 999,
              background: "linear-gradient(90deg, rgba(176,125,43,0.5), rgba(228,184,77,0.4))",
              color: "#e4b84d",
              border: "2px solid rgba(228,184,77,0.6)",
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
          {input.qrDataUrl ? (
            <img src={input.qrDataUrl} width={qrSize} height={qrSize} alt="" />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: qrSize,
                height: qrSize,
                padding: 16,
                borderRadius: 16,
                background: "rgba(255,255,255,0.06)",
                border: "2px dashed rgba(228,184,77,0.45)",
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
                wordBreak: "break-all",
                lineHeight: 1.35,
              }}
            >
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
                {isRtl ? "رابط البروفايل" : "Profile link"}
              </span>
              <span>{input.profileUrl.replace(/^https?:\/\//, "")}</span>
            </div>
          )}
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
