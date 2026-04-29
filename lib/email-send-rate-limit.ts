/** Anti-spam même e-mail ; stockage mémoire (fonctionnel sur une instance / dev). En prod multiples instances : envisager Redis. */

type Entry = {
  /** Dernier envoi réussi. */
  lastSentAt: number;
};

const store = new Map<string, Entry>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Mode « livraison client » (`EMAIL_REPEAT_PROTECT` + production) : TTL strict.
 * `RATE_LIMIT_EMAIL_MS=0` traité comme erreur de config → 24 h.
 */
function cooldownMsEmailRepeatProtectProduction(): number {
  const rateRaw = process.env.RATE_LIMIT_EMAIL_MS?.trim();
  if (rateRaw === undefined || rateRaw === "") return 86400_000;
  const n = Number.parseInt(rateRaw, 10);
  if (!Number.isFinite(n) || n <= 0) return 86400_000;
  if (n < 60000) return 86400_000;
  const maxMs = Number.parseInt(
    process.env.RATE_LIMIT_EMAIL_MAX_MS ?? "604800000",
    10,
  );
  const cap =
    Number.isFinite(maxMs) && maxMs >= 60000 ? maxMs : 7 * 86400_000;
  return Math.min(n, cap);
}

/**
 * Fenêtre entre deux envois au même adresse.
 *
 * **`EMAIL_REPEAT_PROTECT=true`** sur la **production uniquement** :
 * force la protection (anti ré-envois). Ignore `SKIP_GIFT_*`, `NEXT_PUBLIC_DEMO_*`, etc.
 * Checklist livraison : **`AGENTS.md`**, **`.env.example`**.
 *
 * Sans ce flag (tests / présentoir) — assouplissements possibles :
 * `RATE_LIMIT_EMAIL_MS=0`, `SKIP_GIFT_EMAIL_SEND_COOLDOWN=true`, `NODE_ENV=development`,
 * `NEXT_PUBLIC_DEMO_REPLAY=true` (ordre dans le code).
 */
export function getEmailSendCooldownMs(): number {
  const protect =
    (process.env.EMAIL_REPEAT_PROTECT?.trim() === "true" ||
      process.env.EMAIL_REPEAT_PROTECT?.trim() === "1") &&
    process.env.NODE_ENV === "production";

  if (protect) {
    const rateRaw = process.env.RATE_LIMIT_EMAIL_MS?.trim();
    if (rateRaw === "0") return 86400_000;
    return cooldownMsEmailRepeatProtectProduction();
  }

  const rateRaw = process.env.RATE_LIMIT_EMAIL_MS?.trim();
  if (rateRaw === "0") return 0;

  const skipGiftCooldown = process.env.SKIP_GIFT_EMAIL_SEND_COOLDOWN?.trim();
  if (
    skipGiftCooldown === "true" ||
    skipGiftCooldown === "1" ||
    skipGiftCooldown === "yes"
  ) {
    return 0;
  }

  if (process.env.NODE_ENV === "development") return 0;

  const pubDemo =
    process.env.NEXT_PUBLIC_DEMO_REPLAY?.trim() === "true" ||
    process.env.NEXT_PUBLIC_DEMO_REPLAY?.trim() === "1";

  if (pubDemo) return 0;

  if (rateRaw === undefined || rateRaw === "") return 86400_000;
  const n = Number.parseInt(rateRaw, 10);
  if (!Number.isFinite(n)) return 86400_000;
  if (n === 0) return 0;
  if (n < 60000) return 86400_000;
  const maxMs = Number.parseInt(
    process.env.RATE_LIMIT_EMAIL_MAX_MS ?? "604800000",
    10,
  );
  const cap =
    Number.isFinite(maxMs) && maxMs >= 60000 ? maxMs : 7 * 86400_000;
  return Math.min(n, cap);
}

/** Réserve l’email pour un envoi (appeler avant Resend après autres vérifs). */
export function canSendGiftEmail(email: string): {
  ok: true;
} | { ok: false; retryAfterSeconds: number } {
  const cooldown = getEmailSendCooldownMs();
  if (cooldown <= 0) return { ok: true };

  const key = normalizeEmail(email);
  const last = store.get(key);
  const now = Date.now();
  if (last !== undefined && now - last.lastSentAt < cooldown) {
    const retryAfterMs = cooldown - (now - last.lastSentAt);
    return {
      ok: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }
  return { ok: true };
}

export function recordGiftEmailSent(email: string): void {
  const key = normalizeEmail(email);
  store.set(key, { lastSentAt: Date.now() });
}
