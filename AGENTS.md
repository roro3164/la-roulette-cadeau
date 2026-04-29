<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Livraison site client (roulette cadeau — protection e-mail)

Après la phase **présentoir / démo**, pour un **vrai déploiement client** :

1. Mettre **`EMAIL_REPEAT_PROTECT=true`** sur l’environnement **production** (Variable d’environnement Vercel, pas seulement `.env.local`).
2. **Retirer ou commenter** les options de test : `SKIP_GIFT_EMAIL_SEND_COOLDOWN`, `NEXT_PUBLIC_DEMO_REPLAY`, **`RATE_LIMIT_EMAIL_MS=0`** (ou laisser un délai client explicite, ex. `86400000`).
3. Retirer préremplissage e-mail démo / flags `REVIEW_SKIP` si utilisés.
4. Re-déployer pour que le bundle serveur prenne bien les valeurs.

Une seule ligne **`EMAIL_REPEAT_PROTECT=true`** suffit à réactiver la logique stricte dans `lib/email-send-rate-limit.ts` même si d’anciennes variables démo restent par erreur.
