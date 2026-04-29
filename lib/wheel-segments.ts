/** 6 lots — `cafe.png` / `boisson.png` utilisés deux fois avec des libellés distincts. */

export const NEXT_VISIT_PRIZE_NOTE = "À utiliser lors d'une prochaine visite.";

export const WHEEL_SEGMENTS = [
  {
    label: "Réduction de -20 % pour la prochaine fois",
    src: "/wheel/cadeau.png",
  },
  { label: "Dessert", src: "/wheel/dessert.png" },
  { label: "Café", src: "/wheel/cafe.png" },
  { label: "Boisson", src: "/wheel/boisson.png" },
  { label: "Café", src: "/wheel/cafe.png" },
  { label: "Boisson", src: "/wheel/boisson.png" },
] as const;

/**
 * Poids du tirage (`somme === 1000`).
 * Café reste majoritaire (~48 % cumulées) mais un peu diminuée ; dessert et boisson renforcés.
 */
export const SEGMENT_SPIN_WEIGHTS: readonly number[] = [
  50, // Réduction ~5 %
  190, // Dessert (~19 %)
  240, // Café
  160, // Boisson
  240, // Café (~48 % les deux cafés)
  120, // Boisson (~28 % les deux boissons)
];

export type WheelSegment = (typeof WHEEL_SEGMENTS)[number];

export const SEGMENT_COUNT = WHEEL_SEGMENTS.length;

if (SEGMENT_SPIN_WEIGHTS.length !== SEGMENT_COUNT) {
  throw new Error(
    "SEGMENT_SPIN_WEIGHTS doit contenir une entrée par case de roue.",
  );
}

/** Image `public/...` pour un libellé de lot (e-mail, page d’ouverture). Premier match si libellés dupliqués. */
export function prizeSrcForLabel(label: string): string | undefined {
  return WHEEL_SEGMENTS.find((s) => s.label === label)?.src;
}
