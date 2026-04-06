/**
 * GA4 custom events when analytics cookies are accepted and gtag is loaded (see AnalyticsConsent).
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
    .gtag;
  if (typeof gtag !== "function") return;
  gtag("event", eventName, params ?? {});
}
