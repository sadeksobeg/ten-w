/** Stronger stinger for climax / impact beats (optional). */
export function playDemoImpactStinger(enabled: boolean): void {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 220;
    osc.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.14, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    osc.start(now);
    osc.stop(now + 0.4);
    osc.onended = () => void ctx.close();
  } catch {
    /* ignore */
  }
}

/** Short UI chime for demo beats — respects reduced motion at call site. */
export function playDemoChime(enabled: boolean): void {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 740;
    osc.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.07, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.2);
    osc.onended = () => void ctx.close();
  } catch {
    /* ignore */
  }
}
