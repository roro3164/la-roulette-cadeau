import { cookies } from "next/headers";
import {
  createSpunPayload,
  PLAY_SESSION_COOKIE,
  signPlaySession,
  verifyPlaySession,
} from "@/lib/play-session";
import { SEGMENT_SPIN_WEIGHTS } from "@/lib/wheel-segments";
import { SPIN } from "@/lib/user-messages";

function weightedIndex(weights: readonly number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]!;
    if (r < 0) return i;
  }
  return weights.length - 1;
}

/**
 * Tirage côté serveur : réservé à une session « débloquée » après l’avis (cookie signé).
 */
export async function POST() {
  const jar = await cookies();
  const raw = jar.get(PLAY_SESSION_COOKIE)?.value;

  const p = verifyPlaySession(raw ?? undefined);

  if (p === null) {
    return Response.json({ error: SPIN.sessionInvalid }, { status: 403 });
  }

  if (!p.unlocked) {
    return Response.json({ error: SPIN.sessionInvalid }, { status: 403 });
  }

  if (p.spun) {
    return Response.json({ error: SPIN.alreadyPlayed }, { status: 409 });
  }

  const winningIndex = weightedIndex(SEGMENT_SPIN_WEIGHTS);

  const spun = createSpunPayload(p, winningIndex);

  jar.set({
    name: PLAY_SESSION_COOKIE,
    value: signPlaySession(spun),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: Math.ceil((p.exp - Date.now()) / 1000),
  });

  return Response.json({ winningIndex });
}
