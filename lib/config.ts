/**
 * Valeurs par défaut pour le développement / démo.
 * En production : surcharger via variables d’environnement.
 */
export const googleReviewUrl =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ??
  "https://g.page/r/CVzBJfaxy32ZEBM/review";

/** Quand `true`, affiche « Passer (test) » sur l’étape avis Google. Désactiver en prod. */
export const reviewSkipEnabled =
  process.env.NEXT_PUBLIC_REVIEW_SKIP_ENABLED === "true";

/**
 * Champ e-mail prérempli (facultatif). Pour dev : `NEXT_PUBLIC_GIFT_EMAIL_PREFILL=vous@domaine.fr` dans `.env.local`.
 * Par défaut le champ reste vide — tout le monde peut saisir n’importe quelle adresse.
 */
export const giftEmailPrefill =
  process.env.NEXT_PUBLIC_GIFT_EMAIL_PREFILL?.trim() ?? "";

/**
 * Si `false` : aucun overlay « La roue dans N secondes » (chrono désactivé, logique intacte).
 * Réactiver avec `NEXT_PUBLIC_REVIEW_STEP_COUNTDOWN_ENABLED=true` dans `.env.local`.
 */
export const reviewStepCountdownEnabled =
  process.env.NEXT_PUBLIC_REVIEW_STEP_COUNTDOWN_ENABLED === "true";

/**
 * secondes d’attente après l’avis Google avant d’afficher la roulette (0 = pas d’attente).
 * Pratique courante sur les jeux / parcours fidélité pour limiter la triche.
 */
export const rouletteUnlockSeconds = (() => {
  const raw = process.env.NEXT_PUBLIC_ROULETTE_UNLOCK_SECONDS;
  if (raw === "0") return 0;
  const n = parseInt(raw ?? "6", 10);
  if (Number.isNaN(n)) return 6;
  return Math.max(0, Math.min(n, 120));
})();

/** Démo uniquement&nbsp;: bouton «&nbsp;Rejouer&nbsp;» après la fin pour relancer tout le flux. Production&nbsp;: laisser `false`. */
export const demoReplayEnabled =
  process.env.NEXT_PUBLIC_DEMO_REPLAY === "true";

export function getAppOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}

/** Utilisé côté serveur pour construire des liens absolus (e-mail, etc.). */
export function getRequestOrigin(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (env) return env;
  const host = req.headers.get("host");
  if (host) {
    const localhost = host.startsWith("127.") || host.includes("localhost");
    const proto =
      req.headers.get("x-forwarded-proto") ?? (localhost ? "http" : "https");
    return `${proto}://${host}`;
  }
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}
