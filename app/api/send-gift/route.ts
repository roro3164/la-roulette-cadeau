import { cookies } from "next/headers";
import { Resend } from "resend";
import {
  canSendGiftEmail,
  recordGiftEmailSent,
} from "@/lib/email-send-rate-limit";
import { getRequestOrigin } from "@/lib/config";
import { buildGiftEmailHtml } from "@/lib/email-html";
import { signGiftPayload } from "@/lib/gift-token";
import { PLAY_SESSION_COOKIE, verifyPlaySession } from "@/lib/play-session";
import {
  WHEEL_SEGMENTS,
  prizeSrcForLabel,
} from "@/lib/wheel-segments";
import { SEND_GIFT } from "@/lib/user-messages";

const MAX_BODY = 4096;

type Body = {
  email?: string;
  name?: string;
  prizeLabel?: string;
  acceptedTerms?: boolean;
};

export async function POST(req: Request) {
  let json: Body;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY) {
      console.error("[send-gift] Corps de requête trop volumineux.");
      return Response.json({ error: SEND_GIFT.badRequest }, { status: 413 });
    }
    json = JSON.parse(text) as Body;
  } catch {
    console.error("[send-gift] Corps JSON illisible.");
    return Response.json({ error: SEND_GIFT.badRequest }, { status: 400 });
  }

  const email = typeof json.email === "string" ? json.email.trim() : "";
  const name = typeof json.name === "string" ? json.name.trim() : "";
  const prizeLabel =
    typeof json.prizeLabel === "string" ? json.prizeLabel.trim() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: SEND_GIFT.emailInvalid }, { status: 400 });
  }
  if (!prizeLabel || prizeLabel.length > 120) {
    return Response.json({ error: SEND_GIFT.prizeInvalid }, { status: 400 });
  }
  if (json.acceptedTerms !== true) {
    return Response.json(
      { error: SEND_GIFT.termsRequired },
      { status: 400 },
    );
  }

  const jar = await cookies();
  const raw = jar.get(PLAY_SESSION_COOKIE)?.value;
  const session = verifyPlaySession(raw ?? undefined);

  if (
    session === null ||
    !session.unlocked ||
    !session.spun ||
    session.winningIndex === null
  ) {
    return Response.json({ error: SEND_GIFT.sessionInvalid }, { status: 403 });
  }

  const expectedLabel = WHEEL_SEGMENTS[session.winningIndex]?.label;
  if (!expectedLabel || expectedLabel !== prizeLabel) {
    return Response.json({ error: SEND_GIFT.prizeMismatch }, { status: 403 });
  }

  const cooldownCheck = canSendGiftEmail(email);
  if (!cooldownCheck.ok) {
    const min = Math.max(1, Math.ceil(cooldownCheck.retryAfterSeconds / 60));
    const msg =
      min >= 1440
        ? `Cette adresse a déjà reçu un bon — réessayez dans environ ${Math.ceil(min / 1440)} jour${Math.ceil(min / 1440) > 1 ? "s" : ""}.`
        : `Cette adresse a déjà reçu un bon — réessayez dans environ ${min} minute${min > 1 ? "s" : ""}.`;
    return Response.json({ error: msg }, { status: 429 });
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) {
    console.error(
      "[send-gift] RESEND_API_KEY manquante — renseignez-la dans .env.local (voir .env.example) puis redémarrez le serveur.",
    );
    return Response.json(
      { error: SEND_GIFT.serviceUnavailable },
      { status: 503 },
    );
  }

  const origin = getRequestOrigin(req);
  const token = signGiftPayload({
    prize: prizeLabel,
    email,
    t: Date.now(),
  });
  const openGiftUrl = `${origin}/cadeau/ouvrir?token=${encodeURIComponent(token)}`;

  const html = buildGiftEmailHtml({
    prizeLabel,
    recipientName: name.length > 0 ? name : null,
    openGiftUrl,
    prizeImageAbsoluteUrl: `${origin}${prizeSrcForLabel(prizeLabel) ?? "/wheel/cadeau.png"}`,
  });

  const from =
    process.env.EMAIL_FROM?.trim() ??
    `La roulette cadeau <onboarding@resend.dev>`;

  const resend = new Resend(resendKey);

  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject: `Votre cadeau à la roulette : ${prizeLabel}`,
    html,
  });

  if (error) {
    console.error(
      "[send-gift] Échec Resend (détail réservé aux logs) :",
      error.message ?? error,
    );
    return Response.json({ error: SEND_GIFT.sendFailed }, { status: 502 });
  }

  recordGiftEmailSent(email);

  jar.delete(PLAY_SESSION_COOKIE);

  console.info("[send-gift] E-mail parti, id=", data?.id, "→", email);

  return Response.json({
    ok: true,
    emailSent: true,
    messageId: data?.id,
  });
}
