import { escape } from "./html-escape";

export function buildGiftEmailHtml(params: {
  prizeLabel: string;
  recipientName: string | null;
  openGiftUrl: string;
  /** URL absolue de l’illustration du lot (même visuel que la roue). */
  prizeImageAbsoluteUrl: string;
}): string {
  const { prizeLabel, recipientName, openGiftUrl, prizeImageAbsoluteUrl } =
    params;
  const greeting =
    recipientName && recipientName.trim().length > 0
      ? `Bonjour ${escape(recipientName.trim())},`
      : "Bonjour,";

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /></head>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.55;color:#431407;background:#fff7ed;margin:0;padding:24px;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;padding:28px 24px;box-shadow:0 10px 40px rgba(194,65,12,0.12);border:1px solid #fed7aa;">
    <tr><td align="center" style="padding-bottom:18px;">
      <img src="${escape(prizeImageAbsoluteUrl)}" alt="" width="120" height="120" style="display:block;width:120px;height:120px;object-fit:contain;border-radius:16px;background:linear-gradient(145deg,#fffbeb,#ffedd5);" />
    </td></tr>
    <tr><td>
      <p style="margin:0 0 16px;font-size:16px;color:#431407;">${greeting}</p>
      <p style="margin:0 0 16px;font-size:16px;color:#431407;">Votre bon pour&nbsp;: <strong>${escape(prizeLabel)}</strong>.</p>
      <p style="margin:0 0 24px;font-size:14px;color:#78350f;line-height:1.55;">
        Ce bon vaut lors d’une <strong>prochaine visite</strong>. Conservez ce message&nbsp;: au comptoir, montrez cet e-mail. Le bouton dévoile le détail depuis votre téléphone sur place avec l’équipe.
      </p>
      <p style="margin:0;text-align:center;">
        <a href="${escape(openGiftUrl)}" style="display:inline-block;background:linear-gradient(90deg,#ea580c,#fbbf24);color:#ffffff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:9999px;font-size:15px;">
          Ouvrir le cadeau
        </a>
      </p>
    </td></tr>
  </table>
  <p style="text-align:center;font-size:12px;color:#a16207;margin-top:16px;">
    Si vous n’avez pas participé au jeu, ignorez cet e-mail.
  </p>
</body>
</html>`;
}
