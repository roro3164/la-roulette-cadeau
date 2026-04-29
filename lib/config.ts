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

/** Préremplissage par défaut si `NEXT_PUBLIC_DEMO_REPLAY=true` (sans email explicite dans l’ENV). */
const DEMO_GIFT_EMAIL_PREFILL = "romaindesigncode@gmail.com";

/**
 * Champ e-mail prérempli (facultatif).
 * En **démo** (`NEXT_PUBLIC_DEMO_REPLAY=true`) : `DEMO_GIFT_EMAIL_PREFILL` si `NEXT_PUBLIC_GIFT_EMAIL_PREFILL` est absent ou vide.
 * Sinon : uniquement `NEXT_PUBLIC_GIFT_EMAIL_PREFILL` (sinon champ vide).
 */
export const giftEmailPrefill =
  process.env.NEXT_PUBLIC_GIFT_EMAIL_PREFILL?.trim() ||
  (process.env.NEXT_PUBLIC_DEMO_REPLAY === "true" ? DEMO_GIFT_EMAIL_PREFILL : "");

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

function normalizeAppUrl(raw: string | undefined): string {
  const t = raw?.trim();
  if (!t) return "";
  return t.endsWith("/") ? t.slice(0, -1) : t;
}

function deriveOriginFromRequestHeaders(req: Request): string | null {
  const xfHost = req.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = xfHost ?? req.headers.get("host")?.trim();
  if (!host) return null;

  const hl = host.toLowerCase();
  const hostLooksLoopback =
    hl.startsWith("127.") ||
    hl === "localhost" ||
    hl.startsWith("localhost:") ||
    hl.startsWith("[::");

  const xfProto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "";
  const proto =
    xfProto || (hostLooksLoopback ? "http" : "https");

  return `${proto}://${host}`;
}

function isLoopbackAppUrl(appUrl: string): boolean {
  try {
    const u = new URL(appUrl);
    const h = u.hostname.toLowerCase();
    return (
      h === "localhost" ||
      h.endsWith(".localhost") ||
      h === "127.0.0.1" ||
      h === "[::1]"
    );
  } catch {
    return false;
  }
}

function sameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return normalizeAppUrl(a) === normalizeAppUrl(b);
  }
}

/**
 * Origine absolue pour les liens générés côté serveur (ex. mail « Dévoiler le lot »).
 *
 * En **développement**, si `NEXT_PUBLIC_APP_URL` vise `localhost` mais que le client
 * appelle l’API depuis le réseau local (`http://192.168.x.x:3000`), on utilise l’hôte
 * de la requête — sinon le mail contiendrait `localhost`, injoignable depuis un téléphone.
 * En prod, l’URL figée dans l’ENV gagne lorsqu’elle n’est pas limitée au loopback.
 */
export function getRequestOrigin(req: Request): string {
  const envUrl = normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  const fromReq = deriveOriginFromRequestHeaders(req);

  if (envUrl) {
    const envIsLoopback = isLoopbackAppUrl(envUrl);
    if (
      process.env.NODE_ENV === "development" &&
      envIsLoopback &&
      fromReq &&
      !sameOrigin(envUrl, fromReq)
    ) {
      console.info(
        "[getRequestOrigin] dev : lien absolu depuis l’hôte réel de la requête (pas localhost).",
      );
      return fromReq;
    }
    return envUrl;
  }

  if (fromReq) return fromReq;

  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}
