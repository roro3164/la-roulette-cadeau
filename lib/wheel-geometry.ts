/** Tout le rendu (disque, cadre) partage le même repère, centré sur la roue. */
export const WHEEL_VB = 400;
/** Marge VB autour de 0…400 pour le pointeur (au-dessus du cadre) + contours / filtres. */
export const WHEEL_VB_PAD = 78;
/** viewBox identique pour le disque et la jante (même `meet` dans le carré CSS). */
export const WHEEL_VIEW_BOX = `-${WHEEL_VB_PAD} -${WHEEL_VB_PAD} ${WHEEL_VB + 2 * WHEEL_VB_PAD} ${WHEEL_VB + 2 * WHEEL_VB_PAD}`;
/** Angle « sommet » sous le pointeur, en ° depuis le haut (0 = midi, 90 = à droite). Aligné avec le calcul de tirage. */
export const WHEEL_POINTER_DEG_FROM_TOP = 90;

/** Centre du dessin dans le même repère (unités VB). */
export const WHEEL_CX = 200;
export const WHEEL_CY = 200;
export const RIM_OUT = 200;
export const RIM_IN = 170;
export const RIM_CENTER_R = (RIM_IN + RIM_OUT) / 2;
export const RIM_STROKE = RIM_OUT - RIM_IN;

/** Disque jusqu’à l’anneau intérieur de la jante : pas de bande crème sous le métal décoratif. */
export const DISC_R = RIM_IN;
export const DISC_TEXT_R = 112;
export const DISC_HUB_R = 24;
