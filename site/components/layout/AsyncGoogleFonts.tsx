"use client";

const FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Cairo:wght@600;700&family=Tajawal:wght@400;700&family=Inter:wght@400;600;700&display=swap";

/** Non-blocking Google Fonts (avoids render-blocking @import in global CSS). */
export function AsyncGoogleFonts() {
  return (
    <>
      <link rel="preload" as="style" href={FONT_STYLESHEET} />
      <link
        rel="stylesheet"
        href={FONT_STYLESHEET}
        media="print"
        onLoad={(e) => {
          (e.currentTarget as HTMLLinkElement).media = "all";
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href={FONT_STYLESHEET} />
      </noscript>
    </>
  );
}
