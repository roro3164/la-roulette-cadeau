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
    <tr><td align="center" style="padding-bottom:16px;">
      <img src="${escape(prizeImageAbsoluteUrl)}" alt="" width="120" height="120" style="display:block;margin:0 auto;width:120px;height:120px;object-fit:contain;border-radius:16px;background:linear-gradient(145deg,#fffbeb,#ffedd5);" />
      <p style="margin:10px 0 0;font-size:13px;color:#78350f;text-align:center;line-height:1.4;">
        À montrer à l’accueil.
      </p>
    </td></tr>
    <tr><td>
      <p style="margin:0 0 12px;font-size:16px;color:#431407;">${greeting}</p>
      <p style="margin:0 0 20px;font-size:16px;color:#431407;">Votre lot&nbsp;: <strong>${escape(prizeLabel)}</strong></p>
      <p style="margin:0;text-align:center;">
        <a href="${escape(openGiftUrl)}" style="display:inline-block;background:linear-gradient(90deg,#ea580c,#fbbf24);color:#ffffff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:9999px;font-size:15px;">
          Dévoiler le lot
        </a>
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:14px 0 0;">
        <tr><td style="padding:12px 10px;background:#fffbeb;border-radius:12px;font-size:12px;color:#78350f;line-height:1.5;text-align:left;border:1px solid #fcd34d;">
          <p style="margin:0 0 8px;"><strong>Première fois</strong> après le bouton&nbsp;: votre lot apparaît <strong>une seule fois</strong> depuis ce lien (vous ne rejouez pas une deuxième fois).</p>
          <p style="margin:0;"><strong>Ensuite</strong>, si vous rouvrez le même lien (même e-mail)&nbsp;: la page conserve votre lot et peut afficher <strong>le jour et l’heure</strong> de cette ouverture, avec le badge <strong>Déjà ouvert</strong> lorsque tout est déjà enregistré — c’est normal, votre avantage reste celui figurant dans ce message.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  <p style="text-align:center;font-size:11px;color:#a16207;margin-top:14px;">
    Participé au jeu par erreur&nbsp;? Ignorez ce message.
  </p>
</body>
</html>`;
}
