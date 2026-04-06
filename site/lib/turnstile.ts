/**
 * Verifies a Cloudflare Turnstile token server-side.
 * Set TURNSTILE_SECRET_KEY in production when using the widget.
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;

  const trimmed = token.trim();
  if (!trimmed) return false;

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", trimmed);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}
