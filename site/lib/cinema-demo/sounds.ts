let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function tone(freq: number, durationMs: number, volume = 0.08) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = "sine";
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + durationMs / 1000);
}

let lastSeatSound = 0;

export function playSeatSelectSound(enabled: boolean) {
  if (!enabled) return;
  const now = Date.now();
  if (now - lastSeatSound < 100) return;
  lastSeatSound = now;
  tone(200, 80, 0.06);
}

export function playSeatDeselectSound(enabled: boolean) {
  if (!enabled) return;
  const now = Date.now();
  if (now - lastSeatSound < 100) return;
  lastSeatSound = now;
  tone(150, 60, 0.05);
}

export function playProjectorTick(enabled: boolean) {
  if (!enabled) return;
  tone(880, 40, 0.04);
}

export function playCountdownTick(enabled: boolean) {
  if (!enabled) return;
  tone(440, 60, 0.05);
}

export function playSuccessChime(enabled: boolean) {
  if (!enabled) return;
  tone(523, 100, 0.06);
  setTimeout(() => tone(659, 120, 0.05), 100);
}
