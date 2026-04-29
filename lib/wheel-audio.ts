/** Court « clic » pour la roulette — Web Audio, pas de fichier externe. */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function resumeAudioContext(): void {
  const c = getCtx();
  if (c?.state === "suspended") void c.resume();
}

export function playWheelTick(intensity = 0.08): void {
  const c = getCtx();
  if (!c) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  const filter = c.createBiquadFilter();

  osc.type = "square";
  osc.frequency.value = 420 + Math.random() * 80;

  filter.type = "lowpass";
  filter.frequency.value = 2200;

  const t = c.currentTime;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(intensity, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);

  osc.start(t);
  osc.stop(t + 0.07);
}

export function playWheelStopChime(): void {
  const c = getCtx();
  if (!c) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(523.25, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(784, c.currentTime + 0.12);

  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.35);

  osc.connect(gain);
  gain.connect(c.destination);

  const t = c.currentTime;
  osc.start(t);
  osc.stop(t + 0.4);
}
