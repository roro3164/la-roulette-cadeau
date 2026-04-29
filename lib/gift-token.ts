import { createHmac, timingSafeEqual } from "crypto";

type Payload = {
  prize: string;
  email: string;
  t: number;
};

const algorithm = "sha256";

const DEV_FALLBACK = "dev-only-change-in-production";

function getSecret(): string {
  const raw = process.env.GIFT_TOKEN_SECRET?.trim();
  // Sur Vercel / .env, une ligne vide `GIFT_TOKEN_SECRET=` laisse `""` — `??` ne s’applique pas.
  if (raw && raw.length > 0) return raw;
  return DEV_FALLBACK;
}

export type GiftTokenFailure =
  | "format"
  | "bad_signature"
  | "expired"
  | "invalid_payload";

/**
 * Nettoie le paramètre d’URL : espaces en bordure, retours ligne / espaces insérés par certains clients mail.
 */
export function normalizeGiftTokenFromQuery(raw: string): string {
  let s = raw.trim();
  if (/[\s\u00A0]+/.test(s)) {
    s = s.replace(/[\s\u00A0]+/g, "");
  }
  return s;
}

export function signGiftPayload(payload: Payload): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  const bodyB64 = body.toString("base64url");
  const sig = createHmac(algorithm, getSecret())
    .update(bodyB64)
    .digest("base64url");
  return `${bodyB64}.${sig}`;
}

/**
 * Détail du refus (logs support) — ne pas exposer au client tel quel.
 */
export function verifyGiftTokenResult(
  token: string,
  maxAgeMs: number,
): { ok: true; payload: Payload } | { ok: false; failure: GiftTokenFailure } {
  const normalized = normalizeGiftTokenFromQuery(token);
  if (!normalized) {
    return { ok: false, failure: "format" };
  }

  const parts = normalized.split(".");
  if (parts.length !== 2) {
    return { ok: false, failure: "format" };
  }
  const [bodyB64, sig] = parts;
  if (!bodyB64 || !sig) {
    return { ok: false, failure: "format" };
  }

  const expected = createHmac(algorithm, getSecret())
    .update(bodyB64)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, failure: "bad_signature" };
  }

  let parsed: Payload;
  try {
    parsed = JSON.parse(
      Buffer.from(bodyB64, "base64url").toString("utf8"),
    ) as Payload;
  } catch {
    return { ok: false, failure: "format" };
  }
  if (
    typeof parsed.prize !== "string" ||
    typeof parsed.email !== "string" ||
    typeof parsed.t !== "number"
  ) {
    return { ok: false, failure: "invalid_payload" };
  }
  if (Date.now() - parsed.t > maxAgeMs) {
    return { ok: false, failure: "expired" };
  }
  return { ok: true, payload: parsed };
}

export function verifyGiftToken(
  token: string,
  maxAgeMs: number,
): Payload | null {
  const out = verifyGiftTokenResult(token, maxAgeMs);
  return out.ok ? out.payload : null;
}
