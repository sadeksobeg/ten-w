const INVITE_FONTS =
  "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@500;600;700;800&display=swap";

export function InviteFonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={INVITE_FONTS} />
    </>
  );
}
