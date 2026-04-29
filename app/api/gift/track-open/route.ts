import { GIFT_LINK_MAX_AGE_MS } from "@/lib/gift-config";
import {
  giftOpenStableKey,
  peekOpenedAtMs,
  touchFirstOpenMs,
} from "@/lib/gift-open-store";
import { incrementRevisitPeekCount } from "@/lib/gift-revisit-count";
import { verifyGiftToken } from "@/lib/gift-token";

const MAX_BODY = 8192;

type Body = {
  token?: string;
  /** `"peek"` = lecture uniquement au chargement ; `"open"` = enregistrer première ouverte au clic. */
  intent?: string;
};

/**
 * Associe au lien cadeau une date/heure de première ouverture (fichier local en dev, Upstash Redis sur Vercel).
 */
export async function POST(req: Request) {
  let json: Body;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY) {
      return Response.json({ error: "Requête trop grande" }, { status: 413 });
    }
    json = JSON.parse(text) as Body;
  } catch {
    return Response.json({ error: "Demande invalide" }, { status: 400 });
  }

  const token =
    typeof json.token === "string" ? json.token.trim().slice(0, 8096) : "";
  if (!token) {
    return Response.json({ error: "Lien incomplet." }, { status: 400 });
  }

  const payload = verifyGiftToken(token, GIFT_LINK_MAX_AGE_MS);
  if (!payload) {
    return Response.json({ error: "Lien invalide ou expiré." }, { status: 403 });
  }

  const intentRaw =
    typeof json.intent === "string" ? json.intent.trim().toLowerCase() : "";

  const key = giftOpenStableKey({
    email: payload.email,
    prize: payload.prize,
    t: payload.t,
  });

  if (intentRaw === "peek") {
    const ms = await peekOpenedAtMs(key);
    let revisitPeekCount = 0;
    if (ms !== undefined) {
      revisitPeekCount = await incrementRevisitPeekCount(key);
    }
    return Response.json({
      openedAtISO: ms !== undefined ? new Date(ms).toISOString() : null,
      revisitPeekCount,
    });
  }

  if (intentRaw === "open" || intentRaw === "") {
    const { openedAtMs, wasFirstOpen } = await touchFirstOpenMs(key);
    return Response.json({
      openedAtISO: new Date(openedAtMs).toISOString(),
      wasFirstOpen,
    });
  }

  return Response.json({ error: "Demande invalide" }, { status: 400 });
}
