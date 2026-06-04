/**
 * Public partner self-registration. Default: disabled (admin creates accounts only).
 * Set GROWTH_ALLOW_PUBLIC_REGISTRATION=true in site/.env to re-enable.
 */
export function isPublicRegistrationEnabled(): boolean {
  const raw = process.env.GROWTH_ALLOW_PUBLIC_REGISTRATION?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}
