import { cookies } from "next/headers";
import {
  createSpunPayload,
  PLAY_SESSION_COOKIE,
  signPlaySession,
  verifyPlaySession,
} from "@/lib/play-session";
import { SEGMENT_COUNT } from "@/lib/wheel-segments";
import { SPIN } from "@/lib/user-messages";

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

  const winningIndex = Math.floor(Math.random() * SEGMENT_COUNT);

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
