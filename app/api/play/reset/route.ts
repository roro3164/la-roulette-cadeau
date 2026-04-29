import { cookies } from "next/headers";
import { PLAY_SESSION_COOKIE } from "@/lib/play-session";

/**
 * Efface la session jeu (cookie). Permet de recommencer depuis l’écran final
 * (nouvelle participation / test) sur le même appareil.
 */
export async function POST() {
  const jar = await cookies();
  jar.set({
    name: PLAY_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });

  return Response.json({ ok: true });
}
