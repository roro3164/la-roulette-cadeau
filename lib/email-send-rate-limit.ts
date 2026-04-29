/** Anti-spam même e-mail ; stockage mémoire (fonctionnel sur une instance / dev). En prod multiples instances : envisager Redis. */

type Entry = {
  /** Dernier envoi réussi. */
  lastSentAt: number;
};

const store = new Map<string, Entry>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Fenêtre depuis la dernière envoi réussie. */
export function getEmailSendCooldownMs(): number {
  const raw = process.env.RATE_LIMIT_EMAIL_MS;
  if (raw === undefined || raw === "") return 86400_000; /* 24 h */
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 60000) return 86400_000;
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
  const key = normalizeEmail(email);
  const cooldown = getEmailSendCooldownMs();
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
