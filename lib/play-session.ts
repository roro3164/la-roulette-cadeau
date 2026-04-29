import { createHmac, timingSafeEqual } from "crypto";

export const PLAY_SESSION_COOKIE = "lrc_play";

export type PlaySessionPayload = {
  v: 1;
  unlocked: boolean;
  spun: boolean;
  /** Index dans WHEEL_SEGMENTS après tirage réussi. */
  winningIndex: number | null;
  exp: number;
};

/** Durée après déblocage (avis validé). */
function getPlaySessionTtlMs(): number {
  const raw = process.env.PLAY_SESSION_TTL_MS?.trim();
  if (!raw) return 3 * 60 * 60_000;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return 3 * 60 * 60_000;
  return Math.min(Math.max(n, 60000), 48 * 60 * 60_000);
}

const TTL_MS = getPlaySessionTtlMs();

function getSigningSecret(): string {
  const s =
    process.env.PLAY_SESSION_SECRET?.trim() ??
    process.env.GIFT_TOKEN_SECRET?.trim() ??
    "";
  return s !== "" ? s : "dev-only-change-in-production";
}

function serialize(payload: PlaySessionPayload): string {
  const bodyB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const sig = createHmac("sha256", getSigningSecret())
    .update(bodyB64)
    .digest("base64url");
  return `${bodyB64}.${sig}`;
}

function parseUnsafe(token: string): PlaySessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [bodyB64, sig] = parts;
  if (!bodyB64 || !sig) return null;
  const expected = createHmac("sha256", getSigningSecret())
    .update(bodyB64)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(bodyB64, "base64url").toString("utf8"),
    ) as PlaySessionPayload;
    if (parsed.v !== 1 || typeof parsed.unlocked !== "boolean") return null;
    if (typeof parsed.spun !== "boolean") return null;
    if (typeof parsed.exp !== "number") return null;
    if (
      parsed.winningIndex !== null &&
      (typeof parsed.winningIndex !== "number" ||
        !Number.isInteger(parsed.winningIndex))
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Token pour Set-Cookie. */
export function signPlaySession(payload: PlaySessionPayload): string {
  return serialize(payload);
}

export function verifyPlaySession(
  cookieValue: string | undefined,
): PlaySessionPayload | null {
  if (!cookieValue) return null;
  const p = parseUnsafe(cookieValue);
  if (!p) return null;
  if (Date.now() > p.exp) return null;
  return p;
}

/** État après étape « avis » : roue disponible jusqu’à exp. */
export function createUnlockPayload(now = Date.now()): PlaySessionPayload {
  return {
    v: 1,
    unlocked: true,
    spun: false,
    winningIndex: null,
    exp: now + TTL_MS,
  };
}

export function createSpunPayload(
  payload: PlaySessionPayload,
  winningIndex: number,
): PlaySessionPayload {
  return {
    ...payload,
    spun: true,
    winningIndex,
  };
}
