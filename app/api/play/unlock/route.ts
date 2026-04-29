import { cookies } from "next/headers";
import {
  createUnlockPayload,
  PLAY_SESSION_COOKIE,
  signPlaySession,
} from "@/lib/play-session";

/**
 * Appelée après étape « avis Google » (après ouverture avis ou test démo).
 * Dépose un cookie signé : autorise un tirage pour cette fenêtre ou session navigateur.
 */
export async function POST() {
  const jar = await cookies();
  const payload = createUnlockPayload();
  jar.set({
    name: PLAY_SESSION_COOKIE,
    value: signPlaySession(payload),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: Math.ceil((payload.exp - Date.now()) / 1000),
  });

  return Response.json({ ok: true });
}
