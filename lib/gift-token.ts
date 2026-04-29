import { createHmac, timingSafeEqual } from "crypto";

type Payload = {
  prize: string;
  email: string;
  t: number;
};

const algorithm = "sha256";

function getSecret(): string {
  return process.env.GIFT_TOKEN_SECRET ?? "dev-only-change-in-production";
}

export function signGiftPayload(payload: Payload): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  const bodyB64 = body.toString("base64url");
  const sig = createHmac(algorithm, getSecret())
    .update(bodyB64)
    .digest("base64url");
  return `${bodyB64}.${sig}`;
}

export function verifyGiftToken(
  token: string,
  maxAgeMs: number,
): Payload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [bodyB64, sig] = parts;
  if (!bodyB64 || !sig) return null;
  const expected = createHmac(algorithm, getSecret())
    .update(bodyB64)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let parsed: Payload;
  try {
    parsed = JSON.parse(
      Buffer.from(bodyB64, "base64url").toString("utf8"),
    ) as Payload;
  } catch {
    return null;
  }
  if (
    typeof parsed.prize !== "string" ||
    typeof parsed.email !== "string" ||
    typeof parsed.t !== "number"
  ) {
    return null;
  }
  if (Date.now() - parsed.t > maxAgeMs) return null;
  return parsed;
}
