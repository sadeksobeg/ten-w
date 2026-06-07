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

export function playCameraMoveSound(enabled: boolean) {
  if (!enabled) return;
  tone(320, 50, 0.04);
}

let ambienceOsc: OscillatorNode | null = null;
let ambienceGain: GainNode | null = null;

export function startHallAmbience(enabled: boolean) {
  stopHallAmbience();
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  void ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 52;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 1.8);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  ambienceOsc = osc;
  ambienceGain = gain;
}

export function stopHallAmbience() {
  const ctx = getCtx();
  if (!ctx || !ambienceOsc || !ambienceGain) return;
  ambienceGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
  const osc = ambienceOsc;
  window.setTimeout(() => {
    try {
      osc.stop();
    } catch {
      /* already stopped */
    }
  }, 700);
  ambienceOsc = null;
  ambienceGain = null;
}

export function playProjectorRoll(enabled: boolean) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  void ctx.resume();
  for (let i = 0; i < 8; i++) {
    window.setTimeout(() => tone(120 + i * 18, 35, 0.025), i * 90);
  }
  window.setTimeout(() => playProjectorTick(enabled), 720);
}

export function playBootBeep(enabled: boolean) {
  if (!enabled) return;
  tone(660, 40, 0.04);
}

export function playAuthSuccess(enabled: boolean) {
  if (!enabled) return;
  tone(523, 80, 0.05);
  setTimeout(() => tone(784, 100, 0.05), 90);
}

export function playSeatSelectChime(enabled: boolean) {
  if (!enabled) return;
  tone(400, 150, 0.07);
}

export function playNotificationPing(enabled: boolean) {
  if (!enabled) return;
  tone(880, 60, 0.04);
}
