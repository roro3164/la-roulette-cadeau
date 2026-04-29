/** 6 lots — `cafe.png` / `boisson.png` utilisés deux fois avec des libellés distincts. */

export const NEXT_VISIT_PRIZE_NOTE = "À utiliser lors d'une prochaine visite.";

export const WHEEL_SEGMENTS = [
  {
    label: "-20 % lors de votre prochaine visite",
    src: "/wheel/cadeau.png",
  },
  { label: "Dessert", src: "/wheel/dessert.png" },
  { label: "Café offert", src: "/wheel/cafe.png" },
  { label: "Boisson", src: "/wheel/boisson.png" },
  { label: "Café", src: "/wheel/cafe.png" },
  { label: "Boisson", src: "/wheel/boisson.png" },
] as const;

export type WheelSegment = (typeof WHEEL_SEGMENTS)[number];

export const SEGMENT_COUNT = WHEEL_SEGMENTS.length;

/** Image `public/...` pour un libellé de lot (e-mail, page d’ouverture). */
export function prizeSrcForLabel(label: string): string | undefined {
  return WHEEL_SEGMENTS.find((s) => s.label === label)?.src;
}
