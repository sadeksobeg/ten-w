const INVITE_FONTS =
  "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&display=swap";

export function InviteFonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={INVITE_FONTS} />
    </>
  );
}
