import type { Options } from "canvas-confetti";

const PRIZE_COLORS = [
  "#f97316",
  "#facc15",
  "#ea580c",
  "#fbbf24",
  "#fb923c",
  "#fef08a",
  "#f59e0b",
  "#fde047",
] as const;

const base: Partial<Options> = {
  colors: [...PRIZE_COLORS],
  /** Laisser les confettis visibles même si l’utilisateur a « réduire les mouvements » (animation courte côté canvas-confetti). */
  disableForReducedMotion: false,
  /** Au-dessus de tout l’UI (overlay gain, modales), voir Wheel.tsx */
  zIndex: 20000,
};

export type ConfettiOrigin = { x: number; y: number };

/** Coordonnées 0–1 (canvas-confetti) : centre du bouton, légèrement au-dessus. */
export function getConfettiOriginAboveButton(
  el: HTMLElement | null,
  abovePx: number = 16,
): ConfettiOrigin | null {
  if (typeof window === "undefined" || !el) return null;
  const { innerWidth, innerHeight } = window;
  if (innerWidth <= 0 || innerHeight <= 0) return null;
  const r = el.getBoundingClientRect();
  const x = (r.left + r.width / 2) / innerWidth;
  const y = (r.top - abovePx) / innerHeight;
  return {
    x: Math.max(0.02, Math.min(0.98, x)),
    y: Math.max(0.02, Math.min(0.98, y)),
  };
}

export function launchPrizeConfetti(origin?: ConfettiOrigin) {
  if (typeof window === "undefined") return;

  const o = origin ?? { x: 0.5, y: 0.78 };

  void import("canvas-confetti").then(({ default: confetti }) => {
    void confetti({
      ...base,
      particleCount: 120,
      spread: 100,
      startVelocity: 40,
      gravity: 0.95,
      origin: o,
      scalar: 1,
      ticks: 400,
    });

    window.setTimeout(() => {
      void confetti({
        ...base,
        particleCount: 70,
        spread: 100,
        startVelocity: 28,
        origin: o,
        angle: 60,
      });
      void confetti({
        ...base,
        particleCount: 70,
        spread: 100,
        startVelocity: 28,
        origin: o,
        angle: 120,
      });
    }, 120);

    window.setTimeout(() => {
      void confetti({
        ...base,
        particleCount: 80,
        spread: 80,
        startVelocity: 32,
        origin: o,
        scalar: 0.85,
        ticks: 300,
      });
    }, 280);
  });
}
