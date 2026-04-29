/** Textes affichés aux joueurs — ton simple, pas de jargon technique. */

export const SEND_GIFT = {
  badRequest: "Un petit souci est survenu. Actualisez la page et réessayez.",
  emailInvalid: "Adresse e-mail invalide. Vérifiez et réessayez.",
  prizeInvalid: "Repartez de la roulette pour continuer.",
  termsRequired: "Cochez la case du règlement pour recevoir votre bon.",
  serviceUnavailable:
    "L’envoi par e-mail est momentanément indisponible. Réessayez dans un moment ou demandez au comptoir.",
  sendFailed: "L’e-mail n’est pas parti. Réessayez dans quelques minutes.",
  prizeMismatch: "Repartez du début : lancez encore la roue puis recommencez.",
  sessionInvalid:
    "Cette étape a expiré. Rechargez la page et refaites l’avis Google.",
  rateLimitedMinutes:
    "Cette adresse a déjà reçu un bon récemment. Réessayez plus tard.",
} as const;

/** Tirage (/api/spin). */
export const SPIN = {
  sessionInvalid:
    "Actualisez la page et refaites l’avis Google avant de lancer la roue.",
  alreadyPlayed: "Vous avez déjà joué pour cette visite.",
} as const;

/** Formulaire e-mail (client). */
export const EMAIL_FORM = {
  genericError: "Impossible d’envoyer pour l’instant. Réessayez.",
  notConfirmed: "L’envoi n’a pas été confirmé. Réessayez.",
  network: "Connexion faible. Réessayez dans un instant.",
} as const;
