import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

type OgImageProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  locale?: string;
};

export function generateOgImage({ title, subtitle, eyebrow, locale }: OgImageProps) {
  const isRtl = locale === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px 72px",
          background: "linear-gradient(145deg, #0a0a0c 0%, #121212 45%, #1a1510 100%)",
          color: "#f5f5f5",
          fontFamily: "system-ui, sans-serif",
          direction: dir,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#c9a061",
            }}
          >
            T.E.N.E.G.T.A
          </span>
          {locale ? (
            <span style={{ fontSize: 18, color: "rgba(255,255,255,0.45)" }}>
              {locale.toUpperCase()}
            </span>
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 960 }}>
          {eyebrow ? (
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(201,160,97,0.85)",
              }}
            >
              {eyebrow}
            </span>
          ) : null}
          <span
            style={{
              fontSize: title.length > 60 ? 44 : 52,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </span>
          {subtitle ? (
            <span
              style={{
                fontSize: 24,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.72)",
              }}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            fontSize: 16,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <span>AI Systems</span>
          <span>·</span>
          <span>Cybersecurity</span>
          <span>·</span>
          <span>Software Engineering</span>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
